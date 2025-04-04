import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (localFilePath, owner) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: owner,
            // access_mode: "authenticated",
        });

        console.log("File uploaded to Cloudinary:", response.public_id);

        // Optional: Delete local file after successful upload
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);

        // Remove local file if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};


const deleteVideoFromCloudinary = async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      console.log('Deleted Successfully:', result);
      return result;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  };

export { uploadOnCloudinary , deleteVideoFromCloudinary};