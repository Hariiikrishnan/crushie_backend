import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

var p_uid ;

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'images')
    },
    filename:(req,file,cb)=>{
        p_uid = uuidv4() 
        console.log(p_uid)
        console.log(file)
        // cb(null,p_uid+path.extname(file.originalname))
        cb(null,p_uid+".jpg")
    }
})

const upload = multer({storage:storage})

export {upload,p_uid};
// export default uploadImage