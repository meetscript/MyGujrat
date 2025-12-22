import multer from "multer";
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 10,                 // max 10 images
  },
});
// in this config images will be stored in memory temporarily before uploading to cloudinary client->multer->RAM->cloudinary
export default upload;

// you can use this config too , when we dont need to store images locally, resizing image  and conditional uploads but for now we are using local storage
// in this config images will be uploaded directly to cloudinary client->multer->cloudinary
//const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "multi-images",
//     allowed_formats: ["jpg", "jpeg", "png"],
//   },
// });

// const upload = multer({
//   storage,
//   limits: { files: 10 },
// });
