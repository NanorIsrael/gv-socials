import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User, { UserI } from "../models/User";

/* REGISTER USER */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      password: hashedPassword,
      email,
    });

    const savedUser: UserI = await newUser.save();
    const clonedUser: { password?: string } = savedUser;
    delete clonedUser.password;
    res.status(201).json(clonedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json("An §error occured");
  }
};

/* LOGGING IN USER */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "user does not exist." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "email and password do not match" });
    }

    const jwtSecret = process.env.JWT_SECRET as string;
    const token = jwt.sign({ id: user._id }, jwtSecret);

    const clonedUser: { password?: string } = user;
    delete clonedUser.password;
    res.status(200).json({ token, user: clonedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json("An §error occured");
  }
};
