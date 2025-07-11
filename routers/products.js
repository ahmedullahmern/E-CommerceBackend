import 'dotenv/config'
import express from 'express';
import { authenticationAdmin, authenticationUser } from '../midelewear/authentication.js';
import { productSchema } from '../validation/product.js';
import sendResponse from '../helpers/sendResponse.js';
import Product from '../models/products.js';
import multer from "multer";
// import uploadToCloudinary from '../helpers/imageUpload.js';
import Order from '../models/order.js';
import streamUpload from '../helpers/imageUpload.js'

const routers = express.Router()

const storage = multer.memoryStorage(); // Vercel-safe
const upload = multer({ storage });

routers.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const buffer = req.file.buffer;
        const imageUrl = await streamUpload(buffer);
        return res.json({ success: true, url: imageUrl });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Image upload failed' });
    }
});



// const upload = multer({ dest: "uploads/" }); // local tmp upload

// routers.post("/upload", upload.single("image"), async (req, res) => {
//     try {
//         const localPath = req.file.path;
//         const imageUrl = await uploadToCloudinary(localPath);
//         return res.json({ success: true, url: imageUrl });
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({ error: "Image upload failed" });
//     }
// });


routers.post("/addproduct", authenticationAdmin, async (req, res) => {
    const { error, value } = productSchema.validate(req.body)
    if (error) return sendResponse(res, 400, null, true, error.message)

    try {
        let newProduct = new Product({ ...value })
        newProduct = await newProduct.save()
        sendResponse(res, 201, newProduct, false, "Product Add Successfully")
    } catch (err) {
        sendResponse(res, 500, null, true, "Server Error: " + err.message)
    }
})


routers.get("/allproducts", async (req, res) => {
    try {
        const products = await Product.find()
        sendResponse(res, 200, products, false, "Products fetched successfully")
    } catch (err) {
        sendResponse(res, 500, null, true, "Server Error: " + err.message)
    }
})



routers.get("/product/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return sendResponse(res, 404, null, true, "Product not found")
        sendResponse(res, 200, product, false, "Product found")
    } catch (err) {
        sendResponse(res, 500, null, true, "Server Error: " + err.message)
    }
})


routers.post("/product/:id/review", authenticationUser, async (req, res) => {
    const { rating, comment } = req.body
    const userId = req.user._id // make sure auth middleware laga ho

    const order = await Order.findOne({
        user: userId,
        'items.product': req.params.id,
        status: 'delivered'
    });

    if (!order) {
        return sendResponse(res, 403, null, true,
            "You can give review only after delivery");
    }


    try {
        const product = await Product.findById(req.params.id)
        if (!product) return sendResponse(res, 404, null, true, "Product not found")

        product.reviews.push({ user: userId, comment, rating })
        const total = product.reviews.reduce((sum, r) => sum + r.rating, 0)
        product.rating = total / product.reviews.length

        await product.save()
        sendResponse(res, 200, product, false, "Review added")
    } catch (err) {
        sendResponse(res, 500, null, true, "Error: " + err.message)
    }
})


// GET: /api/reviews/featured


routers.get("/reviews/featured", async (req, res) => {
    try {
        const products = await Product.find({ "reviews.0": { $exists: true } })
            .select("name images reviews")
            .populate("reviews.user", "name");

        const featured = [];

        products.forEach((product) => {
            product.reviews.forEach((review) => {
                featured.push({
                    productImage: product.images?.[0],
                    productName: product.name,
                    comment: review.comment,
                    rating: review.rating,
                    userName: review.user?.name || "Anonymous"
                });
            });
        });

        // sort by highest rating
        const topFive = featured
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);

        res.json(topFive);
    } catch (err) {
        res.status(500).json({ error: "Server error: " + err.message });
    }
});


export default routers
