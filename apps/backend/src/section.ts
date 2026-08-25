import express from "express"
import { prisma } from "db/client"
import { authMiddleware } from "../middlewares/authMiddleware"
import { createSectionSchema, updateBoardSchema } from "../schema"

const router = express.Router()

router.post("/section", authMiddleware, async (req, res) => {
  const { success, data } = createSectionSchema.safeParse(req.body)

  if (!success) {
    return res.status(400).json({
      success: false,
      error: "please provide valid inputs"
    })
  }
 
  const board = await prisma.board.findUnique({
    where: {
      id: data.boardId
    }
  })

  if (!board) {
    return res.status(404).json({
      success: false,
      error: "board not found"
    })
  }

  const section = await prisma.section.create({
    data: {
      title: data.title,
      boardId: data.boardId
    }
  })

  return res.status(201).json({
    success: false,
    message: "section created successfully",
    data: section
  })
  
})

router.get("/section/:sectionId", authMiddleware, async (req, res) => {
  const sectionId = req.params.sectionId as string

  if (!sectionId) {
    return res.status(400).json({
      success: false,
      error: "sectionId is required"
    })
  }

  const board = await prisma.board.findUnique({
    where: {
      id: sectionId
    }
  })

  if (!board) {
    return res.status(400).json({
      success: false,
      error: "board not found"
    })
  }

  const section = await prisma.section.findUnique({
    where: {
      id: sectionId
    }
  })

  if (!section) {
    return res.status(400).json({
      success: false,
      error: "section not found"
    })
  }
  
  return res.status(200).json({
    success: true,
    message: "section found successfully",
    data: section
  })
})

router.get("/sections", authMiddleware, async (req, res) => {
  const sectionId = req.query.sectionId as string

  if (!sectionId) {
    return res.status(400).json({
      success: false,
      error: "sectionId is required"
    })
  }

  const section = await prisma.section.findUnique({
    where: {
      id: sectionId
    },
    include: {
      board: true
    }
  })

  if (!section) {
    return res.status(400).json({
      success: false,
      error: "section not found"
    })
  }

  
})

router.patch("/section/:sectionId", authMiddleware, async (req, res) => {
  const { success, data } = updateBoardSchema.safeParse(req.body)

  if (!success) {
    return res.status(400).json({
      success: false,
      error: "please provide valid inputs"
    })
  }

  const sectionId = req.params.sectionId as string

  if (!sectionId) {
    return res.status(400).json({
      success: false,
      error: "sectionId is required"
    })
  }

  const section = await prisma.section.findUnique({
    where: {
      id: sectionId
    },
    include: {
      board: true
    }
  })

  if (!section) {
    return res.status(400).json({
      success: false,
      error: "section not found"
    })
  }
   
  const updatedSection = await prisma.section.update({
    where: {
      id: sectionId
    },
    data: {
      title: data.title
    }
  })

  return res.status(200).json({
    success: true,
    message: "section updated successfully",
    data: updatedSection
  })
})

export default router