import { Router } from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { createProperty, deleteProperty, getProperties, getSingleProperty, getUserProperties, updateProperty, updatePropertyImages } from '../controller/property.controller.js';

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").get(getProperties)
router.route("/").post(
    upload.array("property", 2), // Change upload.single to upload.array and specify the field name and maximum count
    createProperty
);
router.route("/:propertyId").get(getSingleProperty)
router.route("/user/:userId").get(getUserProperties)
router.route("/:propertyId").delete(deleteProperty)
router.route("/updateImages/:propertyId").patch(upload.array("image",2), updatePropertyImages);
router.route("/:propertyId").patch(updateProperty);
export default router