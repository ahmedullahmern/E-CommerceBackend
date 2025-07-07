import express from 'express';
import Order from '../models/order.js';
import sendResponse from '../helpers/sendResponse.js';
import { authenticationAdmin } from '../midelewear/authentication.js';
import Product from '../models/products.js';
import { productSchema } from '../validation/product.js';
import User from '../models/auth.js';

const routers = express.Router();

routers.get("/all", authenticationAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user")
            .populate("items.product");
        console.log("First order populated product:", orders[0].items[0].product);

        sendResponse(res, 200, orders, false, "Orders fetched successfully");
    } catch (err) {
        sendResponse(res, 500, null, true, "Server Error: " + err.message);
    }
});


routers.put("/productUpdated/:id", authenticationAdmin, async (req, res) => {
    const { error, value } = productSchema.validate(req.body);
    if (error) return sendResponse(res, 400, null, true, error.message);

    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, value, { new: true });
        sendResponse(res, 200, updated, false, "Product updated successfully");
    } catch (err) {
        sendResponse(res, 500, null, true, "Error: " + err.message);
    }
});



routers.delete("/productDeleted/:id", authenticationAdmin, async (req, res) => {
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
        if (!updated) return sendResponse(res, 500, null, true, "Not Found");
        sendResponse(res, 200, updated, false, "Payment status updated");
    } catch (err) {
        sendResponse(res, 500, null, true, "Error: " + err.message);
    }
});

// users


routers.get("/users", authenticationAdmin, async (req, res) => {
    try {
        // Sab users lao except admin
        const users = await User.find({ role: { $ne: "admin" } });

        // Har user ke orders aur total amount calculate karo
        const userDataWithStats = await Promise.all(users.map(async (user) => {
            const orders = await Order.find({ user: user._id });
            const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                createdAt: user.createdAt,
                totalOrders: orders.length,
                totalSpent,
            };
        }));

        sendResponse(res, 200, userDataWithStats, false, "Users fetched");
    } catch (err) {
        sendResponse(res, 500, null, true, "Server error: " + err.message);
    }
});



routers.delete("/user/:id", authenticationAdmin, async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return sendResponse(res, 404, null, true, "User not found");
        sendResponse(res, 200, null, false, "User deleted successfully");
    } catch (err) {
        sendResponse(res, 500, null, true, "Server Error: " + err.message);
    }
});


routers.patch('/admin/user/:id/ban', authenticationAdmin, async (req, res) => {
    const { id } = req.params;
    const { isBanned } = req.body;

    const user = await User.findByIdAndUpdate(id, { isBanned }, { new: true });
    res.json({ success: true, data: user });
});


// routers.js (already defined router)
routers.get("/dashboard-summary", authenticationAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    const users = await User.find({ role: { $ne: "admin" } });
    const products = await Product.countDocuments();
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalUsers = users.length;
    const totalProducts = products;
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("user");
    
    sendResponse(res, 200, {
      totalOrders, totalRevenue, totalUsers, totalProducts,
      pendingOrders, recentOrders
    }, false, "Dashboard summary");
  } catch (err) {
    sendResponse(res, 500, null, true, err.message);
  }
});


export default routers