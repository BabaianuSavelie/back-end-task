import { z } from "zod";

export const UpdatePostSchema = z.object({
  title: z.string().min(10).max(70).nonempty(),
  content: z.string().min(20).nonempty(),
  isHidden: z.boolean(),
});

export type UpdatePostRequest = z.infer<typeof UpdatePostSchema>;
