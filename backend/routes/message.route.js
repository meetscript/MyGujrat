import express from "express";
 import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { getMessage, sendMessage ,sendImage, sharePost} from "../controllers/message.controller.js";

const router = express.Router();

router.route('/send/:id').post(isAuthenticated, sendMessage);
router.route('/send/image/:id').post(isAuthenticated, upload.single('image'), sendImage);
router.route('/send/post/:id').post(isAuthenticated, sharePost);
router.route('/all/:id').get(isAuthenticated, getMessage);
 
export default router;