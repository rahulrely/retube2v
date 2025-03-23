import { v2 as cloudinary } from 'cloudinary';
import fs from fs;


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECERT // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary =async (localFilePath) =>{
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        });

        ///file upload successfully;

        console.log("File Upload oN cloundinary",response.url)

        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the loacol file save din case fail
        return null;
    }
}

export {uploadOnCloudinary} ;