import { z } from "zod";

// Authentication schemas
export const signUpSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password too long"),
  confirmPassword: z.string(),
  fullName: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  phone: z.string().trim().regex(/^[0-9+()-\s]+$/, "Invalid phone number").min(7, "Phone number too short").max(20, "Phone number too long"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(1, "Password is required").max(100, "Password too long"),
});

// Checkout schemas
export const shippingInfoSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  phone: z.string().trim().regex(/^[0-9+()-\s]+$/, "Invalid phone number").min(7, "Phone too short").max(20, "Phone too long"),
  address: z.string().trim().min(5, "Address too short").max(500, "Address too long"),
  city: z.string().trim().min(1, "City is required").max(100, "City too long"),
  province: z.string().trim().min(1, "Province is required").max(100, "Province too long"),
  postalCode: z.string().trim().min(1, "Postal code is required").max(20, "Postal code too long"),
  country: z.string().trim().min(1, "Country is required").max(100, "Country too long"),
});

// Admin order creation schema
export const createOrderSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required").max(100, "Name too long"),
  customerEmail: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  customerPhone: z.string().trim().regex(/^[0-9+()-\s]+$/, "Invalid phone number").min(7, "Phone too short").max(20, "Phone too long"),
  address: z.string().trim().min(5, "Address too short").max(500, "Address too long"),
  city: z.string().trim().min(1, "City is required").max(100, "City too long"),
  province: z.string().trim().min(1, "Province is required").max(100, "Province too long"),
  postalCode: z.string().trim().min(1, "Postal code is required").max(20, "Postal code too long"),
  country: z.string().trim().min(1, "Country is required").max(100, "Country too long"),
});

// Product schema
export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(200, "Name too long"),
  brand: z.string().trim().min(1, "Brand is required").max(100, "Brand too long"),
  category: z.string().trim().min(1, "Category is required").max(100, "Category too long"),
  price: z.number().positive("Price must be positive").max(999999, "Price too high"),
  description: z.string().trim().max(2000, "Description too long").optional(),
  style: z.string().trim().max(100, "Style too long").optional(),
});
