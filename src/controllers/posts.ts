import { RequestHandler } from "express";

import { SequelizeClient } from "../sequelize";
import { Post } from "../repositories/types";
import { DataTypes } from "sequelize";
import { Status, UserType } from "../constants";
import { RequestAuth } from "../middleware";
import { ForbiddenError, NotFoundError } from "../errors";

export function initListPostsRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  return async function listPostsRequestHandler(req, res, next): Promise<void> {
    try {
      const { models } = sequelizeClient;

      const posts = await models.posts.findAll({
        where: {
          isHidden: false,
        },
      });

      res.send(posts);
      res.end();
    } catch (error) {
      next(error);
    }
  };
}


export function initCreatePostRequesthandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  return async function createPostRequesthandler(
    req,
    res,
    next
  ): Promise<void> {
    try {
      const {
        auth: {
          user: { id: authorId },
        },
      } = req as unknown as { auth: RequestAuth };

      const { title, content } = req.body as CreatePostData;

      await createPost({ title, content, authorId }, sequelizeClient);

      res.status(Status.Created).end();
    } catch (error) {
      next(error);
    }
  };
}

export function initRemovePostRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  return async function removePostRequestHandler(
    req,
    res,
    next
  ): Promise<void> {
    try {
      const { postId } = req.params;

      const {
        auth: {
          user: { id: authorId, type: userType },
        },
      } = req as unknown as { auth: RequestAuth };

      const isAdmin = userType === UserType.ADMIN;

      const existingPost = await sequelizeClient.models.posts.findByPk(postId);

      if (!existingPost)
        throw new NotFoundError(
          `Post with id ${postId} doesn't exist`,
          req.method,
          req.path
        );

      if (!isAdmin && existingPost.authorId !== authorId)
        throw new ForbiddenError("YOU_ARE_NOT_ALLOWED_TO_REMOVE_OTHERS_POST");

      await existingPost.destroy();

      res.status(Status.Ok).end();
    } catch (error) {
      next(error);
    }
  };
}

export function initUpdatePostRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  return async function updatePostRequestHandler(req, res, next) {
    try {
      const {
        auth: {
          user: { id: authorId },
        },
      } = req as unknown as { auth: RequestAuth };

      const { postId } = req.params;
      const { title, content, isHidden } = req.body as UpdatePost;

      const existingPost = await sequelizeClient.models.posts.findByPk(postId);

      if (!existingPost)
        throw new NotFoundError(
          `Post with id ${postId} doesn't exist`,
          req.method,
          req.path
        );

      if (existingPost.authorId !== authorId)
        throw new ForbiddenError("YOU_ARE_NOT_ALLOWED_TO_UPDATE_OTHERS_POST");

      await updatePost(
        existingPost.id,
        authorId,
        { title, content, isHidden },
        sequelizeClient
      );

      res.status(Status.Ok).end();
    } catch (error) {
      next(error);
    }
  };
}


export function initChangeHiddenStatusRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  return async function changeHiddenStatusRequestHandler(
    req,
    res,
    next
  ): Promise<void> {
    try {
      const { models } = sequelizeClient;

      const { postId } = req.params;

      const {
        auth: {
          user: { id: authorId },
        },
      } = req as unknown as { auth: RequestAuth };

      const existingPost = await models.posts.findByPk(postId);

      if (!existingPost)
        throw new NotFoundError(
          `Post with id ${postId} doesn't exist`,
          req.method,
          req.path
        );

      if (existingPost.authorId !== authorId)
        throw new ForbiddenError("YOU_ARE_NOT_ALLOWED_TO_UPDATE_OTHERS_POST");

      existingPost.isHidden = !existingPost?.isHidden;

      await existingPost.save();

      res.status(Status.Ok).end();
    } catch (error) {
      next(error);
    }
  };
}

async function createPost(
  data: CreatePostData,
  sequelizeClient: SequelizeClient
): Promise<void> {
  const { title, content, authorId } = data;

  const { models } = sequelizeClient;

  await models.posts.create({ title, content, authorId });
}

async function updatePost(
  postId: number,
  authorId: number,
  data: UpdatePost,
  sequelizeClient: SequelizeClient
): Promise<void> {
  const { models } = sequelizeClient;

  const { title, content, isHidden } = data;

  await models.posts.update(
    { title, content, isHidden, updatedAt: DataTypes.NOW },
    {
      where: {
        id: postId,
        authorId,
      },
    }
  );
}

type CreatePostData = Pick<Post, "title" | "content" | "authorId">;
type UpdatePost = Pick<Post, "title" | "content" | "isHidden">;
