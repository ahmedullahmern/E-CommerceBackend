// // utils/cloudinary.js
// import 'dotenv/config'
// import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// console.log('💥 Cloudinary ENV:', {
//     cloud: process.env.CLOUDINARY_CLOUD_NAME,
//     key: process.env.CLOUDINARY_API_KEY,
//     secret: process.env.CLOUDINARY_API_SECRET
// });

// export default cloudinary;



import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

