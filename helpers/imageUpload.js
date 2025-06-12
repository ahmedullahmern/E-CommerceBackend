import fs from 'fs';
import cloudinary from './cloudinary.js';

const uploadToCloudinary = async (localFilePath) => {
    try {
        const result = await cloudinary.uploader.upload(localFilePath, {
            folder: "products" // optional
        });
        fs.unlinkSync(localFilePath); // local file delete after upload
        return result.secure_url;
    } catch (err) {
        throw err;
    }
};

export default uploadToCloudinary