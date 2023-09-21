import { z } from "zod";

export const RegisterUserSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email().nonempty(),
  password: z.string().min(6).nonempty(),
});
