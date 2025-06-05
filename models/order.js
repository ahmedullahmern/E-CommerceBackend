import mongoose from "mongoose";
const { Schema } = mongoose;


const orderSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: Number,
            size: String,
            color: String
        }
    ],
    totalAmount: Number,
    address: String,
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending"
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online'],
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    }
    
}, { timestamps: true });


const Order = mongoose.model("Order", orderSchema);

export default Order;