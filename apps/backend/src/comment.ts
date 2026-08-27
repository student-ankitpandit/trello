import express from "express"
import { prisma } from "db/client"
import { authMiddleware } from "../middlewares/authMiddleware"
import { commentCreateSchema } from "../schema"

const router = express.Router()

router.post("/comment/:issueId", authMiddleware, async (req, res) => {
  const { success, data } = commentCreateSchema.safeDecode(req.body)
  if (!success) {
    return res.status(400).json({
      success: false,
      error: "please provide valid data"
    })
  }

  const userId = req.id
  const issueId = req.params.issueId as string

  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
      board: {
        org: {
          memberships: {
            some: {
              userId
            }
          }
        }
      }
    },
    include: {
      section: true
    }
  })

  if (!issue) {
    return res.status(404).json({
      success: false,
      error: "issue not found"
    })
  }

  const comment = await prisma.comment.create({
    data: {
      comment: data.comment,
      issueId: issue.id,
      userId: userId
    },
    include: {
      user: {
        select: {
          id: true,
          email: true
        }
      }
    }
  })

  if (!comment) {
    return res.status(500).json({
      success: false,
      error: "failed to post comment"
    })
  }

  return res.status(201).json({
    success: true,
    message: "comment created successfully",
    data: comment.comment,
    user: comment.user
  })
})

router.get("/comment/:issueId", authMiddleware, async (req, res) => {
  const issueId = req.params.issueId as string

  if(!issueId) {
    return res.status(400).json({
      success: false,
      error: "issueId is required"
    })
  }

  const userId = req.id

  const issues = await prisma.issue.findUnique({
    where: {
      id: issueId,
      board: {
        org: {
          memberships: {
            some: {
              userId
            }
          }
        }
      }
    },
    include: {
      comments: {
        include: {
          user: {
            select: {
              id: true,
              email: true
            }
          }
        }
      }
    }
  })

  if(!issues) {
    return res.status(404).json({
      success: false,
      error: "comment not found"
    })
  }

  return res.status(200).json({
    success: true,
    message: "comment fetched successfully",
    data: issues.comments,
    user: issues.comments.map(c => c.user)
  })
})

router.patch("/comment/:commentId", authMiddleware, async (req, res) => {
  const userId = req.id
  const commentId = req.params.commentId as string

  if(!commentId) {
    return res.status(400).json({
      success: false,
      error: "comment is required"
    })
  }

  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
      issue: {
        board: {
          org: {
            memberships: {
              some: {
                userId
              }
            }
          }
        }
      }
    },
    include: {
      user: {
        select: {
          id: true,
          email: true
        }
      }
    }
  })

  if(!comment) {
    return res.status(404).json({
      success: false,
      error: "comment not found"
    })
  }

  return res.status(200).json({
    success: true,
    message: "comment updated successfully",
    data: comment.comment,
    user: comment.user
  })
})

router.delete("/comment/:commentId", authMiddleware, async (req, res) => {
  const userId = req.id
  const commentId = req.params.commentId as string

  if(!commentId) {
    return res.status(400).json({
      success: false,
      error: "comment is required"
    })
  }

  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
      issue: {
        board: {
          org: {
            memberships: {
              some: {
                userId
              }
            }
          }
        }
      }
    },
    include: {
      user: {
        select: {
          id: true,
          email: true
        }
      }
    }
  })

  if(!comment) {
    return res.status(404).json({
      success: false,
      error: "comment not found"
    })
  }

  await prisma.comment.delete({
    where: {
      id: commentId
    }
  })

  return res.status(200).json({
    success: true,
    message: "comment deleted successfully",
    data: comment.comment,
    user: comment.user
  })
})

export default router