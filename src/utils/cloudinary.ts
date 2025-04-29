import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOncloudinary = async (localFilePath: string) => {
    try {
        if (!localFilePath) return null;
        const result = await cloudinary.uploader.upload(
            localFilePath, {
            resource_type: 'auto',
        }
        );
        // console.log("file uploaded on cloudinary");
        //once the file is uploaded, delete the local file
        fs.unlinkSync(localFilePath);
        return result;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}
const deleteFromCloudinary = async (cloudinaryUrl: string) => {
    try {
        if (!cloudinaryUrl) return null;
        const result = await cloudinary.uploader.destroy(
            cloudinaryUrl, {
            invalidate: true,
        }
        );
        // console.log("file deleted from cloudinary");
        return result;
    } catch (error) {
        return null;
    }
}

export { uploadOncloudinary, deleteFromCloudinary };
