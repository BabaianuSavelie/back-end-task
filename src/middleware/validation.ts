import { RequestHandler } from "express";
import { z } from "zod";

export function initRequestValidationRequestHandler(
  schema: z.AnyZodObject
): RequestHandler {
  return async function RequestvalidationRequestHandler(
    req,
    res,
    next
  ): Promise<void> {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      let err = error;

      if (err instanceof z.ZodError)
        err = err.issues.map((e) => ({ path: e.path[0], message: e.message }));
      res.status(400).json({
        status: "failed",
        error: err,
      });
    }
  };
}
