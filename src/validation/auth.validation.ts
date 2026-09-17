import z from "zod";

export const createUserBody = z.object({
    email: z.email(),
    password: z.string(),
});

export const refreshSchema = z.object({
  refreshToken: z.string({
      message: "Refresh token is required",
  }),
});

const createUserQuery = z.object({
  sendWelcomeEmail: z.enum(["true", "false"]).transform((val) => val === "true"),
});

const createUserParams = z.object({
  tenantId: z.string().uuid(),
});


export type RegisterInput = z.infer<typeof createUserBody>;
export type RefreshInput = z.infer<typeof refreshSchema>;