import cloudinary from "cloudinary";
import fs from 'fs';

async function uploadToCloudinary(locaFilePath) {
    // locaFilePath :
    // path of image which was just uploaded to "uploads" folder
    var mainFolderName = "main"
    var filePathOnCloudinary = mainFolderName + "/images" + locaFilePath
    // filePathOnCloudinary :
    // path of image we want when it is uploded to cloudinary
    return cloudinary.uploader.upload(locaFilePath,{"public_id":filePathOnCloudinary})
    .then((result) => {
      // Image has been successfully uploaded on cloudinary
      // So we dont need local image file anymore
      // Remove file from local uploads folder 
      fs.unlinkSync(locaFilePath)
      
      return {
        message: "Success",
        url:result.url
      };
    }).catch((error) => {
      // Remove file from local uploads folder 
      fs.unlinkSync(locaFilePath)
      return {message: "Fail",};
    });
  }

  export default uploadToCloudinary;