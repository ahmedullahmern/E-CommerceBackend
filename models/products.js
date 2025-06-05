import mongoose from "mongoose";
const { Schema } = mongoose;

const productSchema = new Schema({
    name: { type: String, required: true }, // e.g. "Cotton Nightsuit - Pink"
    description: { type: String, required: true }, // full detail
    price: { type: Number, required: true }, // e.g. 1499
    sizes: [String], // e.g. ["S", "M", "L", "XL"]
    colors: [String], // e.g. ["Pink", "Blue"]
    images: [String], // image URLs
    stock: { type: Number, default: 0 }, // available quantity
    category: { type: String, default: "nightsuit" }, // category name
    material: String, // e.g. "Cotton", "Silk"
    rating: { type: Number, default: 0 }, // optional: user rating
    reviews: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            comment: String,
            rating: Number,
        }
    ]
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;
