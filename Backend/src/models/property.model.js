import mongoose, { Schema } from "mongoose";

const PropertySchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    image: [{
        type: String,
        required: true
    }],
    imagePublicId: [{
        type: String,
        required: true
    }],
    address: {
        type: String,
        required: true,
        trim: true
    },
    regularPrice: {
        type: Number,
        required: true
    },
    discountPrice: {
        type: Number,
        required: true,
        default: 0
    },
    rent: {
        type: Boolean,
        default: false
    },
    sell: {
        type: Boolean,
        default: false
    },
    parking: {
        type: Boolean,
        default: false
    },
    furnished: {
        type: Boolean,
        default: false
    },
    offer: {
        type: Boolean,
        default: false
    },
    beds: {
        type: Number,
        required: true
    },
    baths: {
        type: Number,
        required: true
    },
},{
    timestamps: true
})

export const Property = mongoose.model("Property", PropertySchema)