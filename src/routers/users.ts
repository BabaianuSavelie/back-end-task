import { Router } from "express";

import type { SequelizeClient } from "../sequelize";

import {
  initTokenValidationRequestHandler,
  initAdminValidationRequestHandler,
} from "../middleware/security";

import {
  initListUsersRequestHandler,
  initUserPostsListRequestHandler,
  initCreateUserRequestHandler,
  initLoginUserRequestHandler,
  initRegisterUserRequestHandler,
} from "../controllers";

import {
  registerRequestValidation,
  loginRequestValidation,
  createUserRequestValidation,
} from "../validation/validator";

export function initUsersRouter(sequelizeClient: SequelizeClient): Router {
  const router = Router({ mergeParams: true });

  const tokenValidation = initTokenValidationRequestHandler(sequelizeClient);
  const adminValidation = initAdminValidationRequestHandler();

  router
    .route("/")
    .get(tokenValidation, initListUsersRequestHandler(sequelizeClient))
    .post(
      tokenValidation,
      adminValidation,
      createUserRequestValidation,
      initCreateUserRequestHandler(sequelizeClient)
    );

  router
    .route("/posts")
    .get(tokenValidation, initUserPostsListRequestHandler(sequelizeClient));

  router
    .route("/login")
    .post(loginRequestValidation, initLoginUserRequestHandler(sequelizeClient));
  router
    .route("/register")
    .post(
      registerRequestValidation,
      initRegisterUserRequestHandler(sequelizeClient)
    );

  return router;
}
