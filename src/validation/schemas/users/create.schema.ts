import { z } from "zod";

export const CreateUserSchema = z.object({
  type: z.enum(["admin", "blogger"], {
    errorMap: () => {
      return { message: "Invalid role" };
    },
  }),
  name: z.string().nonempty(),
  email: z.string().email().nonempty(),
  password: z.string().min(6).nonempty(),
});
