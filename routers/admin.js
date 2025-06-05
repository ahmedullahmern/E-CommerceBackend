import express from 'express';
import Order from '../models/order.js';
import sendResponse from '../helpers/sendResponse.js';
import { authenticationAdmin } from '../midelewear/authentication.js';

const routers = express.Router();

routers.get("/all", authenticationAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate("user").populate("items.product");
        sendResponse(res, 200, orders, false, "Orders fetched successfully");
    } catch (err) {
        sendResponse(res, 500, null, true, "Server Error: " + err.message);
    }
});


routers.put("/product/:id", authenticationAdmin, async (req, res) => {
    const { error, value } = productSchema.validate(req.body);
    if (error) return sendResponse(res, 400, null, true, error.message);

    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, value, { new: true });
        sendResponse(res, 200, updated, false, "Product updated successfully");
    } catch (err) {
        sendResponse(res, 500, null, true, "Error: " + err.message);
    }
});



routers.delete("/product/:id", authenticationAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        sendResponse(res, 200, null, false, "Product deleted successfully");
    } catch (err) {
        sendResponse(res, 500, null, true, "Error: " + err.message);
    }
});


routers.put("/status/:id", authenticationAdmin, async (req, res) => {
    const { status } = req.body;
    try {
        const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
        if (!updated) return sendResponse(res, 500, null, true, "Not Found");
        sendResponse(res, 200, updated, false, "Order status updated");
    } catch (err) {
        sendResponse(res, 500, null, true, "Error: " + err.message);
    }
});


routers.put("/update-payment/:id", authenticationAdmin, async (req, res) => {
    const { paymentStatus } = req.body;
    try {
        const updated = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
        sendResponse(res, 200, updated, false, "Payment status updated");
    } catch (err) {
        sendResponse(res, 500, null, true, "Error: " + err.message);
    }
});

routers.put("/product/:id", authenticationAdmin, async (req, res) => {
    const { error, value } = productSchema.validate(req.body);
    if (error) return sendResponse(res, 400, null, true, error.message);

    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, value, { new: true });
        sendResponse(res, 200, updated, false, "Product updated successfully");
    } catch (err) {
        sendResponse(res, 500, null, true, "Error: " + err.message);
    }
});


export default routers