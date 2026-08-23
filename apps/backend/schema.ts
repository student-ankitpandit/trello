import { z } from "zod"
import { string } from "zod/v3"

export const signupSchema =  z.object({
  email: z.string(),
  password: z.string().min(8)
})

export const signinSchema = z.object({
  email: z.string(),
  password: z.string().min(1)
})

export const createOrgSchema = z.object({
  name: z.string(),
  description: z.string()
})

export const updateOrgSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional()
})

export const createBoardSchema = z.object({
  title: z.string(),
  orgId: z.string()
})

export const updateBoardSchema = z.object({
  title: z.string()
})
