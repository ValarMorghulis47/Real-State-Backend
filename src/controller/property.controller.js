import { asyncHandler } from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { Property } from "../models/property.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { DeleteFileCloudinary } from "../utils/DeleteFileCloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose";


const createProperty = asyncHandler(async (req, res, next) => {
    const { title, description } = req.body;
    const images = req.files.map(file => file.path); // Get an array of image paths
    console.log(images);
    if ([title, description, ...images].some((field) => field?.trim() === "")) {
        const error = new ApiError(410, "All fields are required");
        return res.status(error.statusCode).json(error.toResponse());
    }

    const propertyFolder = "property";
    const imageUploadPromises = images.map(image => uploadOnCloudinary(image, propertyFolder)); // Upload images to Cloudinary
    console.log(imageUploadPromises);
    const uploadedImages = await Promise.all(imageUploadPromises);
    const imageUrls = uploadedImages.map(image => image.url); // Get an array of image URLs
    const imagePublicIds = uploadedImages.map(image => image.public_id); // Get an array of image public IDs

    const property = await Property.create({
        title,
        description,
        owner: req.user._id,
        image: imageUrls, // Store the image URLs in the 'images' field
        imagePublicId: imagePublicIds, // Store the image public IDs in the 'imagesPublicIds' field
    });

    if (!property) {
        const error = new ApiError(430, "Property not created, try again later");
        return res.status(error.statusCode).json(error.toResponse());
    }

    return res.status(200).json(
        new ApiResponse(200, property, "Property Created Successfully")
    );
});

const updateProperty = asyncHandler(async (req, res, next) => {
    const { propertyId } = req.params;
    const { title, description, imageIndices } = req.body; // get the imageIndeces like the array indexes
    const files = req.files;

    if (!(title || description || files)) {
        const error = new ApiError(410, "At least One Field Is Required To Update The Property");
        return res.status(error.statusCode).json(error.toResponse());
    }

    const property = await Property.findById(propertyId);
    console.log(property);
    if (files && imageIndices && imageIndices.length === files.length) {
        for (let i = 0; i < files.length; i++) {
            console.log(imageIndices[i]);
            const oldImage = property.image[imageIndices[i]];
            const oldImagePublicId = property.imagePublicId[imageIndices[i]];
            const newImage = await uploadOnCloudinary(files[i].path, 'property');

            if (oldImage) await DeleteFileCloudinary(oldImagePublicId, 'property');

            property.image[imageIndices[i]] = newImage.url;
            property.imagePublicId[imageIndices[i]] = newImage.public_id;
        }
        await property.save();
    }

    const updatedProperty = await Property.findByIdAndUpdate(propertyId, { $set: { title, description } }, { new: true });

    if (!updatedProperty) {
        const error = new ApiError(430, "Property not updated, try again later");
        return res.status(error.statusCode).json(error.toResponse());
    }

    return res.status(200).json(
        new ApiResponse(200, updatedProperty, "Property Updated Successfully")
    );
});

const deleteProperty = asyncHandler(async (req, res, next) => {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);

    if (!property) {
        const error = new ApiError(404, "Property not found");
        return res.status(error.statusCode).json(error.toResponse());
    }

    // Delete images from Cloudinary
    for (let i = 0; i < property.imagePublicId.length; i++) {
        await DeleteFileCloudinary(property.imagePublicId[i], 'property');
    }

    // Delete property from database
    await Property.findByIdAndDelete(propertyId);

    return res.status(200).json(
        new ApiResponse(200, "Property Deleted Successfully")
    );
});

const getProperties = asyncHandler(async (req, res, next) => {
    const {page=1, limit=10} = req.query;
    const properties = await Property.find().limit(limit * 1).skip((page - 1) * limit);
    const totalProperties = await Property.countDocuments();
    if (!properties.length) {
        const error = new ApiError(404, "Properties not found");
        return res.status(error.statusCode).json(error.toResponse());
    }
    return res.status(200).json(
        new ApiResponse(200, {properties: properties, totalProperties: totalProperties}, "Properties Fetched Successfully")
    )
})

const getSingleProperty = asyncHandler(async (req, res, next) => {
    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);
    if (!property) {
        const error = new ApiError(404, "Property not found");
        return res.status(error.statusCode).json(error.toResponse());
    }
    return res.status(200).json(
        new ApiResponse(200, property, "Property Fetched Successfully")
    )
})

export {createProperty, updateProperty, deleteProperty, getProperties}