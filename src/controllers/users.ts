import { RequestHandler } from "express";

import { SequelizeClient } from "../sequelize";
import { User } from "../repositories/types";
import { Op } from "sequelize";
import { Status, UserType } from "../constants";
import { RequestAuth } from "../middleware";
import { BadRequestError, UnauthorizedError } from "../errors";
import { comparePassword, generateToken, hashPassword } from "../security";

export function initListUsersRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  return async function listUsersRequestHandler(req, res, next): Promise<void> {
    const { models } = sequelizeClient;

    try {
      const {
        auth: {
          user: { type: userType },
        },
      } = req as unknown as { auth: RequestAuth };

      const isAdmin = userType === UserType.ADMIN;

      const users = await models.users.findAll({
        attributes: isAdmin ? ["id", "name", "email"] : ["name", "email"],
        ...(!isAdmin && { where: { type: { [Op.ne]: UserType.ADMIN } } }),
        raw: true,
      });

      res.send(users);

      res.end();
    } catch (error) {
      next(error);
    }
  };
}

export function initUserPostsListRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  return async function initUserPostsListRequestHandler(
    req,
    res,
    next
  ): Promise<void> {
    try {
      const { models } = sequelizeClient;

      const {
        auth: {
          user: { id: authorId },
        },
      } = req as unknown as { auth: RequestAuth };

      const posts = await models.posts.findAll({
        where: {
          authorId: authorId,
        },
      });

      res.send(posts).end();
    } catch (error) {
      next(error);
    }
  };
}

export function initCreateUserRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  return async function createUserRequestHandler(
    req,
    res,
    next
  ): Promise<void> {
    try {
      // NOTE(roman): missing validation and cleaning
      const { type, name, email, password } = req.body as CreateUserData;

      await createUser({ type, name, email, password }, sequelizeClient);

      return res.status(Status.NoContent).end();
    } catch (error) {
      next(error);
    }
  };
}

export function initLoginUserRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  return async function loginUserRequestHandler(req, res, next): Promise<void> {
    const { models } = sequelizeClient;

    try {
      // NOTE(roman): missing validation and cleaning
      const { email, password } = req.body as {
        name: string;
        email: string;
        password: string;
      };

      const user = (await models.users.findOne({
        attributes: ["id", "passwordHash"],
        where: { email },
        raw: true,
      })) as Pick<User, "id" | "passwordHash"> | null;
      if (!user) {
        throw new UnauthorizedError("EMAIL_OR_PASSWORD_INCORRECT");
      }

      const passwordMatch = await comparePassword(password, user.passwordHash);

      if (!passwordMatch) {
        throw new UnauthorizedError("EMAIL_OR_PASSWORD_INCORRECT");
      }

      const token = generateToken({ id: user.id });

      return res.send({ token }).end();
    } catch (error) {
      next(error);
    }
  };
}

export function initRegisterUserRequestHandler(
  sequelizeClient: SequelizeClient
): RequestHandler {
  return async function createUserRequestHandler(
    req,
    res,
    next
  ): Promise<void> {
    try {
      // NOTE(roman): missing validation and cleaning
      const { name, email, password } = req.body as Omit<
        CreateUserData,
        "type"
      >;

      await createUser(
        { type: UserType.BLOGGER, name, email, password },
        sequelizeClient
      );

      return res.status(Status.NoContent).end();
    } catch (error) {
      next(error);
    }
  };
}

async function createUser(
  data: CreateUserData,
  sequelizeClient: SequelizeClient
): Promise<void> {
  const { type, name, email, password } = data;

  const { models } = sequelizeClient;

  const similarUser = (await models.users.findOne({
    attributes: ["id", "name", "email"],
    where: {
      [Op.or]: [{ name }, { email }],
    },
    raw: true,
  })) as Pick<User, "id" | "name" | "email"> | null;
  if (similarUser) {
    if (similarUser.name === name) {
      throw new BadRequestError("NAME_ALREADY_USED");
    }
    if (similarUser.email === email) {
      throw new BadRequestError("EMAIL_ALREADY_USED");
    }
  }

  const passwordHash = await hashPassword(password);

  await models.users.create({ type, name, email, passwordHash: passwordHash });
}

type CreateUserData = Pick<User, "type" | "name" | "email"> & {
  password: User["passwordHash"];
};
