import { asyncHandler } from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { Property } from "../models/property.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { DeleteFileCloudinary } from "../utils/DeleteFileCloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose";


const createProperty = asyncHandler(async (req, res, next) => {
    const { title, description, address, regularPrice, discountPrice, sell, rent, parking, furnished, offer, beds, baths } = req.body;
    const images = req.files.map(file => file.path); // Get an array of image paths
    if ([title, description, address].some((field) => field?.trim() === "")) {
        const error = new ApiError(410, "Title, Description and Address are required");
        return res.status(error.statusCode).json(error.toResponse());
    }
    if ([regularPrice, sell, rent, parking, furnished, offer, beds, baths, ...images].some((field) => field?.trim() === "")) {
        const error = new ApiError(410, "All fields are required");
        return res.status(error.statusCode).json(error.toResponse());
    }

    const propertyFolder = "property";
    const imageUploadPromises = images.map(image => uploadOnCloudinary(image, propertyFolder)); // Upload images to Cloudinary
    const uploadedImages = await Promise.all(imageUploadPromises);
    const imageUrls = uploadedImages.map(image => image.url); // Get an array of image URLs
    const imagePublicIds = uploadedImages.map(image => image.public_id); // Get an array of image public IDs

    const property = await Property.create({
        title,
        description,
        owner: req.user._id,
        image: imageUrls, // Store the image URLs in the 'images' field
        imagePublicId: imagePublicIds, // Store the image public IDs in the 'imagesPublicIds' field
        address,
        regularPrice,
        discountPrice,
        sell,
        rent,
        parking,
        furnished,
        offer,
        beds,
        baths
    });

    if (!property) {
        const error = new ApiError(430, "Property not created, try again later");
        return res.status(error.statusCode).json(error.toResponse());
    }

    return res.status(200).json(
        new ApiResponse(200, property, "Property Created Successfully")
    );
});

const updatePropertyImages = asyncHandler(async (req, res, next) => {
    const { propertyId } = req.params;
    const { imageIndices } = req.body; // get the imageIndeces like the array indexes
    const files = req.files;

    if (!files) {
        const error = new ApiError(410, "At least One Image Is Required To Update The Property");
        return res.status(error.statusCode).json(error.toResponse());
    }

    const property = await Property.findById(propertyId);
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
    return res.status(200).json(
        new ApiResponse(200, property, "Property Images Updated Successfully")
    );
});

const updateProperty = asyncHandler(async (req, res, next) => {
    const { propertyId } = req.params;
    const { title, description } = req.body;

    if (!(title || description || files)) {
        const error = new ApiError(410, "At least One Field Is Required To Update The Property");
        return res.status(error.statusCode).json(error.toResponse());
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
    const { page = 1, limit = 10 } = req.query;

    const properties = await Property.aggregate([
        {
            $lookup: {
                from: "users", // Name of the User collection
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $project: {
                username: 1,
                avatar: 1,
                // Include other property fields you need
                owner: {
                    $arrayElemAt: ["$ownerDetails", 0]
                }
            }
        },
        {
            $limit: limit * 1
        },
        {
            $skip: (page - 1) * limit
        }
    ]);

    const totalProperties = await Property.countDocuments();

    if (!properties.length) {
        const error = new ApiError(404, "Properties not found");
        return res.status(error.statusCode).json(error.toResponse());
    }

    return res.status(200).json(
        new ApiResponse(200, { properties: properties, totalProperties: totalProperties }, "Properties Fetched Successfully")
    );
});

const getSingleProperty = asyncHandler(async (req, res, next) => {
    const { propertyId } = req.params;
    const propertyexits = await Property.findById(propertyId);
    if (!propertyexits) {
        const error = new ApiError(404, "Property not found");
        return res.status(error.statusCode).json(error.toResponse());
    }
    const property = await Property.aggregate(
        [
            {
                $match: {
                    _id: mongoose.Types.ObjectId.createFromHexString(propertyId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                avatar: 1,
                                phoneno: 1,
                                city: 1,
                                email: 1,
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    ownerDetails: {
                        $first: "$ownerDetails"
                    }
                }
            },
            {
                $project: {
                    ownerDetails: 1,
                    title: 1,
                    description: 1,
                    image: 1,
                    address: 1,
                    regularPrice: 1,
                    discountPrice: 1,
                    sell: 1,
                    rent: 1,
                    parking: 1,
                    furnished: 1,
                    offer: 1,
                    beds: 1,
                    baths: 1,
                }
            }
        ]
    )
    if (!property.length) {
        const error = new ApiError(404, "Property not found");
        return res.status(error.statusCode).json(error.toResponse());
    }
    return res.status(200).json(
        new ApiResponse(200, property[0], "Property Fetched Successfully")
    )
})

const getUserProperties = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const properties = await Property.find({ owner: userId })
    // .limit(limit * 1)
    // .skip((page - 1) * limit)
    // .exec();
    const totalProperties = await Property.countDocuments({ owner: userId });

    if (!properties.length) {
        const error = new ApiError(404, "Properties not found");
        return res.status(error.statusCode).json(error.toResponse());
    }
    if (totalProperties === 1) {
        return res.status(200).json(
            new ApiResponse(200, { properties: properties[0], totalProperties: totalProperties }, "Properties Fetched Successfully")
        );
    } else {
        return res.status(200).json(
            new ApiResponse(200, { properties: properties, totalProperties: totalProperties }, "Properties Fetched Successfully")
        );
    }
});

export { createProperty, updateProperty, deleteProperty, getProperties, getSingleProperty, getUserProperties, updatePropertyImages }