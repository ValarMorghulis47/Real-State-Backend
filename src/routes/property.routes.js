import { Router } from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { createProperty, deleteProperty, getProperties, updateProperty } from '../controller/property.controller.js';

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").get(getProperties)
router.route("/").post(
    upload.array("image", 2), // Change upload.single to upload.array and specify the field name and maximum count
    createProperty
);
// router.route("/:postId").get(getSinglePost)
// router.route("/user/:userId").get(getUserPosts)
router.route("/:propertyId").delete(deleteProperty)
router.route("/:propertyId").patch(upload.array("image",2), updateProperty);

// router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router