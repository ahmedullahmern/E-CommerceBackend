import express from 'express';
import Order from '../models/order.js';
import sendResponse from '../helpers/sendResponse.js';
import { authenticationAdmin, authenticationUser } from '../midelewear/authentication.js';
import { orderSchema } from '../validation/order.js';
import Product from '../models/products.js';

const routers = express.Router();

routers.post("/place", authenticationUser, async (req, res) => {
    const { error, value } = orderSchema.validate(req.body)
    if (error) return sendResponse(res, 400, null, true, error.message)

    const userId = req.user._id;
    const { items, totalAmount, address, paymentMethod } = value;

    try {
        const paymentStatus = paymentMethod === 'cod' ? 'pending' : 'paid';

        const newOrder = new Order({
            user: userId,
            items,
            totalAmount,
            address,
            paymentMethod,
            paymentStatus
        });

        for (let item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        const savedOrder = await newOrder.save();
        sendResponse(res, 201, savedOrder, false, "Order placed successfully");
    } catch (err) {
        sendResponse(res, 500, null, true, "Server Error: " + err.message);
    }
});


routers.get("/myorders", authenticationUser, async (req, res) => {
    try {
        const userId = req.user._id;

        const orders = await Order.find({ user: userId })
            .populate("items.product")
            .sort({ createdAt: -1 });

        sendResponse(res, 200, orders, false, "Order fethed successfully");
    } catch (err) {
        console.error("Error fetching orders", err);
        sendResponse(res, 500, null, true, "Server Error: " + err.message);
    }
});



routers.put("/cancel/:id", authenticationUser, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return sendResponse(res, 404, null, true, "Order not found");
        if (order.status === "shipped" || order.status === "delivered")
            return sendResponse(res, 400, null, true, "Cannot cancel after shipment");

        order.status = "cancelled";
        await order.save();
        sendResponse(res, 200, order, false, "Order cancelled");
    } catch (err) {
        sendResponse(res, 500, null, true, "Error: " + err.message);
    }
});


export default routers;
