import { Request, Response } from "express";
import User, { UserDoc, UserI } from "../models/User";

/* REGISTER USER */
export const userProfile = async (req: Request, res: Response) => {
  try {
    const { userId, photo, location, occupation } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        photo,
        location,
        occupation,
      },
      {
        upsert: true,
        new: true,
      },
    );

    const savedUser: UserDoc = await updatedUser.save();
    const clonedUser: { password?: string } = savedUser;
    delete clonedUser.password;
    res.status(201).json(clonedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json("An error occured");
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json("An error occured");
  }
};

export const getUserFriends = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user: UserI | null = await User.findById(id);
    if (!user) {
      return res.status(400).json({ error: "invalid user id." });
    }

    const friends: UserDoc[] = (
      await Promise.all(user.friends.map(async (id) => await User.findById(id)))
    ).filter(
      (friend): friend is UserDoc => friend !== null && friend !== undefined,
    );

    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, photo }) => ({
        _id,
        firstName,
        lastName,
        occupation,
        location,
        photo,
      }),
    );

    res.status(200).json(formattedFriends);
  } catch (error) {
    console.log(error);
    res.status(500).json("An error occured");
  }
};

/* UPDATES  */
export const addRemoveFriends = async (req: Request, res: Response) => {
  try {
    const { friendId } = req.params;
    const { userId } = req.body;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user) {
      return res.status(400).json({ error: "Invalid user id." });
    }

    if (!friend) {
      return res.status(400).json({ error: "Invalid friend id." });
    }

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = user.friends.filter((friendId) => friendId !== userId);
    } else {
      user?.friends.push(friendId);
      friend?.friends.push(userId);
    }
    const savedUser = await user?.save();
    await friend?.save();

    const friends: UserDoc[] = (
      await Promise.all(savedUser.friends.map((id) => User.findById(id)))
    ).filter(
      (friend): friend is UserDoc => friend !== null && friend !== undefined,
    );

    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, photo }) => ({
        _id,
        firstName,
        lastName,
        occupation,
        location,
        photo,
      }),
    );

    res.status(200).json(formattedFriends);
  } catch (error) {
    console.log(error);
    res.status(500).json("An error occured");
  }
};
