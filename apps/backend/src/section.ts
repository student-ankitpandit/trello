import express from "express"
import { prisma } from "db/client"
import { authMiddleware } from "../middlewares/authMiddleware"
import { createSectionSchema, updateBoardSchema } from "../schema"
import { checkAdminRole } from "../utils/checkAdminRole"

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

  const userId = req.id
  
  if(!(await checkAdminRole(userId, board.orgId))) {
    return res.status(403).json({
      success: false,
      error: "forbidden, you're have to access to modify this resource"
    })
  } 
  
  const section = await prisma.section.create({
    data: {
      title: data.title,
      boardId: data.boardId
    }
  })

  return res.status(201).json({
    success: true,
    message: "section created successfully",
    data: section
  })
  
})

router.get("/sections", authMiddleware, async (req, res) => {
  const orgId = req.query.orgId as string
  const userId = req.id
  
  if (!orgId) {
    return res.status(400).json({
      success: false,
      error: "orgId is required"
    })
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: userId,
      orgId: orgId
    }
  })

  if (!membership) {
    return res.status(403).json({
      success: false,
      error: "forbidden, you're have to access to read this resource"
    })
  }
  
  const boards = await prisma.board.findMany({
    where: {
      id: orgId 
    },
    include: {
      section: true
    }
  })

  if (!boards) {
    return res.status(400).json({
      success: false,
      error: "section not found"
    })
  }

  return res.status(200).json({
    success: true,
    message: "fetched all sections successfully",
    data: boards
  })
  
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
  const userId = req.id

  if (!sectionId) {
    return res.status(400).json({
      success: false,
      error: "sectionId is required"
    })
  }
  
  const existingSection = await prisma.section.findUnique({
    where: {
      id: sectionId
    },
    include: {
      board: true
    }
  })

  if (!existingSection) {
    return res.status(400).json({
      success: false,
      error: "section not found"
    })
  }
  
  if(!(await checkAdminRole(userId, existingSection.board.orgId))) {
    return res.status(403).json({
      success: false,
      error: "forbidden, you're have to access to modify this resource"
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

router.delete("/section/:sectionId", authMiddleware, async (req, res) => {
  const sectionId = req.params.sectionId as string
  const userId = req.id

  if (!sectionId) {
    return res.status(400).json({
      success: false,
      error: "sectionId is required"
    })
  }

  const section =  await prisma.section.findUnique({
    where: {
      id: sectionId
    },
    include: {
      board: true
    }
  })

  if (!section) {
    return res.status(404).json({
      success: false,
      error: "section not found"
    })
  }

  if(!(await checkAdminRole(userId, section.board.orgId))) {
    return res.status(403).json({
      success: false,
      error: "forbidden, you're have to access to modify this resource"
    })
  }

  await prisma.section.delete({
    where: {
      id: sectionId
    }
  })

  return res.status(200).json({
    success: true,
    message: "section deleted successfully"
  })
})

export default router