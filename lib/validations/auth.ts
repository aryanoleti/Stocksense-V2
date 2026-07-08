import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const tradeSchema = z.object({
  ticker: z.string().min(1),
  quantity: z.number().positive("Quantity must be positive"),
  type: z.enum(["BUY", "SELL"]),
});

export const chatMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  sessionId: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type TradeInput = z.infer<typeof tradeSchema>;

export const realHoldingSchema = z.object({
  ticker: z.string().min(1),
  companyName: z.string().min(1),
  quantity: z.number().positive("Quantity must be positive"),
  avgPrice: z.number().positive("Buy price must be positive"),
  buyDate: z.coerce.date(),
});

export const realHoldingUpdateSchema = z.object({
  quantity: z.number().positive("Quantity must be positive").optional(),
  avgPrice: z.number().positive("Buy price must be positive").optional(),
  buyDate: z.coerce.date().optional(),
});

export type RealHoldingInput = z.infer<typeof realHoldingSchema>;
export type RealHoldingUpdateInput = z.infer<typeof realHoldingUpdateSchema>;
