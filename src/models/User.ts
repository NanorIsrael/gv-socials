import * as bcrypt from "bcrypt";
import mongoose, { Model, Document } from "mongoose";

export interface UserI extends Document {
  _id: string;
  email: string;
  password: string;
  lastName: string;
  firstName: string;
  friends: string[];
  occupation: string;
  location: string;
  photo: string;
  viewedProfileNumber: Number;
  impressions: Number;
}

const UserSchema = new mongoose.Schema<UserI>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    photo: { type: String, default: "" },
    friends: { type: [String], default: [] },
    location: String,
    occupation: String,
    viewedProfileNumber: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre<UserI>("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.statics.findUserByEmail = function (email: string) {
  return this.findOne({ email })
}

const User: Model<UserI> = mongoose.model<UserI>("User", UserSchema);
export default User;
