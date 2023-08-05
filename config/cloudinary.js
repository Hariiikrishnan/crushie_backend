import cloudinary from "cloudinary";

const connectCloudinary = async ()=>{
    try{
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }
    catch(error){
        console.log(`Error With Connecting DB : ${error.message}`)
        process.exit(1)
    }
}

export default connectCloudinary;