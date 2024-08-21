import { Request, Response } from "express";
import Post from "../models/Post";
import User, { UserDoc } from "../models/User";

export const createPost = async (req: Request, res: Response) => {
  try {
    const { userId, description, postPhotoPath } = req.body;

    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      description,
      picturePath: postPhotoPath,
      likes: {},
      comments: [],
    });

    await newPost.save();
    const posts = await Post.find({});

    res.status(201).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "an error occured." });
  }
};

export const getFeedPosts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const posts = await Post.find({});

    const result = await Promise.all(
      posts.map(async (post) => {
        const user: UserDoc | null = await User.findById({ _id: post.userId });

        if (!user) {
          throw Error("a valid user was expected.");
        }
        const formattedResult = {
          firstName: user.firstName,
          lastName: user.lastName,
          _id: post._id,
          userId: post.userId,
          description: post.description,
          likes: post.likes,
          postPhoto: post.picturePath,
          comments: post.comments,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        };
        return formattedResult;
      }),
    );
    posts.forEach((post, idx) => {
      console.log(post);
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "an error occured." });
  }
};

export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ userId });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "an error occured." });
  }
};

/* UPDATE */
export const likePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(id);
    const isLiked = post?.likes?.get(userId);

    if (!isLiked) {
      post?.likes?.set(userId, true);
    } else {
      post?.likes?.delete(userId);
    }

    const updatedPost = await Post.findByIdAndUpdate(id, {
      likes: post?.likes,
    });

    await updatedPost?.save();

    const user: UserDoc | null = await User.findById({
      _id: updatedPost?.userId,
    });

    if (!user) {
      throw Error("a valid user was expected.");
    }

    const formattedResult = {
      firstName: user.firstName,
      lastName: user.lastName,
      _id: updatedPost?._id,
      userId: updatedPost?.userId,
      description: updatedPost?.description,
      postPhoto: updatedPost?.picturePath,
      likes: updatedPost?.likes,
      comments: updatedPost?.comments,
      createdAt: updatedPost?.createdAt,
      updatedAt: updatedPost?.updatedAt,
    };

    res.status(200).json(formattedResult);
  } catch (error) {
    res.status(500).json({ error: "an error occured." });
  }
};
