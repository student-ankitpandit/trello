import { prisma } from "db/client"
import { signupSchema, signinSchema } from "../schema.ts"
import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { authMiddleware } from "../middlewares/authMiddleware.ts"

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in the .env")
}

router.post("/signup", async (req, res) => {
  const { success, data } = signupSchema.safeParse(req.body)
  
  if (!success) {
    return res.status(400).json({
        success: false,
        error: "please provide valid inputs"
      })
    }
    
    const userExists = await prisma.user.findUnique({
      where: {
        email: data.email
      }
    })

    if (userExists) {
      return res.status(400).json({
        success: false,
        error: "user already exists"
      })
    }

  const hashedPassword = await bcrypt.hash(data.password, 10)
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword
      }
    })

  return res.status(201).json({
      success: true,
      message: "user created successfully"
    })
})

router.post("/login", async (req, res) => {
  const { success, data } = signinSchema.safeParse(req.body)

    if (!success) {
      return res.status(400).json({
        success: false,
        error: "please provide valid inputs"
      })
    }

    const user = await prisma.user.findUnique({
      where: {
        email: data.email
      }
    })

    if (!user) {
      return res.status(400).json({
          success: false,
          error: "user not found"
        })
    }

    const password = bcrypt.compare(data.password, user.password)

    if (!password) {
        return res.status(400).json({
          success: true,
          message: "please enter valid password",
        })
      }
  
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET)
    
    return res.status(200).json({
        success: true,
        message: "logged in successfully",
        token: token
      })
})

router.get("/me", authMiddleware, async (req, res) => {
  const userId = req.id
  
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  if (!user) {
    return res.status(400).json({
      success: false,
      error: "user not found"
    })
  }
  
  return res.status(200).json({
    success: true,
    email: user.email
  })
})

export default router

