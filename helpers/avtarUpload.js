import 'dotenv/config'

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

import '../helpers/cloudinary.js'

const avatarUpload = (buffer, folder = 'avatars') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                quality: "auto:low",
                fetch_format: "auto",
                transformation: [
                    { width: 300, crop: "scale" }
                ]
            },
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

export default avatarUpload