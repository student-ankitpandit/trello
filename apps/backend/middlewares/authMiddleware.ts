import type { Request, Response, NextFunction } from "express"
import type { JwtPayload } from "jsonwebtoken"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in .env")
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "unauthorized"
      })
    }

    const decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload
    req.id = decodedToken.id

    next()
  } catch (e: any) {
    console.log(e)
    if (e instanceof Error) {
      return res.status(400).json({
        success: false,
        error: "invalid and expired token"
      })
    }
    return res.status(401).json({
      success: false,
      error: "unauthorized"
    })
  }
}