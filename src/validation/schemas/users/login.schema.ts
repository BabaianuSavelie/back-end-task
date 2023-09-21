import { z } from "zod";

export const LoginUserSchema = z.object({
  email: z.string().email().nonempty(),
  password: z.string(),
});
