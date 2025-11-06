import mongoose from 'mongoose';    

const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    description:
        {
            type: String,
            required: true,
            minlength: 500,
            maxlength: 10000,
        },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        name: { type: String }
    },
    public_id: {
        type: String,
        required: true,
    },
    auther: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    },{timestamps: true});
const City = mongoose.model('City', citySchema);

export default City;