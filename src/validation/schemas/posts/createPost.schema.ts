import { z } from "zod";

export const CreatePostSchema = z.object({
  title: z.string().min(10).max(70).nonempty(),
  content: z.string().min(20).nonempty(),
});

export type CreatePostRequest = z.infer<typeof CreatePostSchema>;
