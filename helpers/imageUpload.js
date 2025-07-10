// import fs from 'fs';
// import cloudinary from './cloudinary.js';

// const uploadToCloudinary = async (localFilePath) => {
//     try {
//         const result = await cloudinary.uploader.upload(localFilePath, {
//             folder: "products" // optional
//         });
//         fs.unlinkSync(localFilePath); // local file delete after upload
//         return result.secure_url;
//     } catch (err) {
//         throw err;
//     }
// };

// export default uploadToCloudinary


// import { v2 as cloudinary } from "cloudinary";
// import streamifier from "streamifier";

// const uploadToCloudinary = (buffer) => {
//     return new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//             { folder: "products" },
//             (error, result) => {
//                 if (error) return reject(error);
//                 resolve(result.secure_url);
//             }
//         );
//         streamifier.createReadStream(buffer).pipe(stream);
//     });
// };

// export default uploadToCloudinary;
import 'dotenv/config'

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

import '../helpers/cloudinary.js'

const streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'products' },
            (error, result) => {
                if (result) resolve(result.secure_url);
                else reject(error);
            }
        );

        const readable = new Readable();
        readable._read = () => { };
        readable.push(buffer);
        readable.push(null);
        readable.pipe(stream);
    });
};



export default streamUpload