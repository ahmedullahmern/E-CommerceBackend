import mongoose from "mongoose";
const { Schema } = mongoose;

const TokenSchema = new mongoose.Schema({
    beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary' },
    department: { type: String, required: true },
    status: { type: String, enum: ['In Progress', 'Completed'], default: 'In Progress' },
});

const Token = mongoose.model('Token', TokenSchema);
export default Token