import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  cnic: String,
  role: {
    type: String,
    enum: ['admin', 'receptionist', 'department', 'beneficiary'],
    default: 'beneficiary'
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
