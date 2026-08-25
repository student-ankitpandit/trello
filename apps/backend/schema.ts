import type { getOriginalNode } from "typescript"
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

export const inviteSchema = z.object({
  email: z.string(),
  orgId: z.string()
})

export const acceptInviteSchema = z.object({
  orgId: z.string()
})

export const createSectionSchema = z.object({
  title: z.string(),
  boardId: z.string()
})

export const updateSectionScheme = z.object({
  title: z.string(),
})