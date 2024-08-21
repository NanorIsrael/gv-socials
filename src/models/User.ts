import * as bcrypt from "bcrypt";
import mongoose, { Model, Document } from "mongoose";

export interface UserI {
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

export interface UserDoc extends UserI, Document {
  _id: string; 
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserModel extends Model<UserDoc> {
  build(attr: UserI): UserDoc
  findUserByEmail(email: string): Promise<UserDoc | null>;
}

const UserSchema = new mongoose.Schema(
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
UserSchema.statics.build = function (attr: UserI) { 
  return new User(attr)
}
UserSchema.statics.findUserByEmail = function (email: string): Promise<UserI | null>  {
  return this.findOne({ email })
}

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.pre<UserDoc>("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});


const User = mongoose.model<UserDoc, UserModel>("User", UserSchema);
export default User;
