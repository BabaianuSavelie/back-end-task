import { Router } from "express";

import { SequelizeClient } from "../sequelize";
import { initTokenValidationRequestHandler } from "../middleware";

import {
  initListPostsRequestHandler,
  initCreatePostRequesthandler,
  initRemovePostRequestHandler,
  initUpdatePostRequestHandler,
  initChangeHiddenStatusRequestHandler,
} from "../controllers";

import {
  createRequestValidation,
  updateRequestValidation,
} from "../validation/validator";

export function initPostsRouter(sequelizeClient: SequelizeClient): Router {
  const router = Router({ mergeParams: true });

  const tokenValidation = initTokenValidationRequestHandler(sequelizeClient);

  router
    .route("/")
    .get(initListPostsRequestHandler(sequelizeClient))
    .post(
      createRequestValidation,
      tokenValidation,
      initCreatePostRequesthandler(sequelizeClient)
    );

  router
    .route("/:postId")
    .delete(tokenValidation, initRemovePostRequestHandler(sequelizeClient))
    .put(
      tokenValidation,
      updateRequestValidation,
      initUpdatePostRequestHandler(sequelizeClient)
    )
    .patch(
      tokenValidation,
      initChangeHiddenStatusRequestHandler(sequelizeClient)
    );
  return router;
}
