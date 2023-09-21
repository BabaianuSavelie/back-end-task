import {
  CreatePostSchema,
  UpdatePostSchema,
  RegisterUserSchema,
  LoginUserSchema,
  CreateUserSchema,
} from "../validation/schemas";
import { initRequestValidationRequestHandler } from "../middleware";

export const createRequestValidation =
  initRequestValidationRequestHandler(CreatePostSchema);

export const updateRequestValidation =
  initRequestValidationRequestHandler(UpdatePostSchema);

export const registerRequestValidation =
  initRequestValidationRequestHandler(RegisterUserSchema);

export const loginRequestValidation =
  initRequestValidationRequestHandler(LoginUserSchema);

export const createUserRequestValidation =
  initRequestValidationRequestHandler(CreateUserSchema);
