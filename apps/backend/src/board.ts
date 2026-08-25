import express from "express"
import { createBoardSchema, updateBoardSchema } from "../schema"
import { prisma } from "db/client"
import { authMiddleware } from "../middlewares/authMiddleware"
import { checkAdminRole } from "../utils/checkAdminRole"

const router = express.Router()

router.get("/boards", authMiddleware, async (req, res) => {
  const { success, data } = createBoardSchema.safeParse(req.body)

  if (!success) {
    return res.status(400).json({
      success: false,
      error: "please enter valid inputs"
    })
  }

  const userId = req.id
  const orgId = req.query.orgId as string

  const membership = await prisma.membership.findFirst({
    where: {
      userId: userId,
      orgId: orgId
    }
  })

  if (!membership) {
    return res.status(403).json({
      success: false,
      error: "forbidden, you don't have the access to this resource"
    })
  }
  
  const board = await prisma.board.create({
    data: {
      title: data.title,
      orgId: orgId
    }
  })

  return res.status(201).json({
    success: true,
    message: "board created successfully",
    board: board
  })
})

router.post("board/create", authMiddleware, async (req, res) => {
  const { success, data } = createBoardSchema.safeParse(req.body)

  if (!success) {
    return res.status(400).json({
      success: false,
      error: "please provide valid inputs"
    })
  }

  const userId = req.id
    
  if (!(await checkAdminRole(userId, data.orgId))) {
    return res.status(403).json({
      success: false,
      error: "you're unauthorized to create a board"
    })
  }

  const board = prisma.board.create({
    data: {
      title: data.title,
      orgId: data.orgId
    }
  })

  return res.status(201).json({
    success: true,
    message: "board created successfully",
    data: board
  })
})

router.patch("/board/:boardId", authMiddleware, async (req, res) => {
  const { success, data } = updateBoardSchema.safeParse(req.body)

  if (!success) {
    return res.status(400).json({
      success: false,
      error: "please provide valid response"
    })
  }

  const userId = req.id
  const boardId = req.params.boardId as string
  
  const board = await prisma.board.findUnique({
    where: {
      id: boardId 
    },
  })

  if (!board) {
    return res.status(404).json({
      success: false,
      error: "board not found"
    })
  }

  if(!(await checkAdminRole(userId, board.orgId))) {
    return res.status(403).json({
        success: false,
        error: "forbidden, you don't have the access to this resource"
      }) 
  }
  
  const updatedBoard = await prisma.board.update({
    where: {
      id: boardId
    },
    data: {
      title: data.title
    }
  })

  return res.status(200).json({
    success: true,
    message: "updated the board successfully",
    data: updatedBoard
  })
})

router.delete("/board/:boardId", authMiddleware, async (req, res) => {
  const boardId = req.params.boardId as string
  const userId = req.id
  
  const board = await prisma.board.findUnique({
    where: {
      id: boardId
    }
  })

  if (!board) {
    return res.status(404).json({
      success: false,
      error: "board not found"
    })
  }

  if(!(await checkAdminRole(userId, board.orgId))) {
    return res.status(403).json({
      success: false,
      error: "forbidden, you don't have the access to this resource"
    })
  }

  const deletedBoard = prisma.board.delete({
    where: {
      id: boardId
    }
  })

  return res.status(200).json({
    succes: false,
    message: "board deleted successfully",
    data: deletedBoard
  })
  
})

export default router
