import mongoose, { Schema } from "mongoose";

const PropertySchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
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
    }]
},{
    timestamps: true
})

export const Property = mongoose.model("Property", PropertySchema)