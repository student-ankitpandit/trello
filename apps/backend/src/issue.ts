import express from "express"
import { prisma } from "db/client"
import { authMiddleware } from "../middlewares/authMiddleware"
import { issueCreateSchema, updateIssueSchema } from "../schema"

const router = express.Router()

router.post("/issue/:sectionId", authMiddleware, async (req, res) => {
  const { success, data } = issueCreateSchema.safeParse(req.body)

  if (!success) {
    return res.status(400).json({
      success: false,
      error: "please provide valid inputs"
    })
  }

  const userId = req.id
  const sectionId = req.params.sectionId as string

  if (!sectionId) {
    return res.status(400).json({
      success: false,
      error: "sectionId is required"
    })
  }

  const section = await prisma.section.findUnique({
    where: {
      id: sectionId,
      board: {
        org: {
          memberships: {
            some: {
              userId: userId
            }
          }
        }
      }
    },
    select: {
      id: true,
      boardId: true
    }
  })

  if (!section) {
    return res.status(404).json({
      success: false,
      error: "section not found"
    })
  }

  const issue = await prisma.issue.create({
    data: {
      title: data.title,
      description: data.description,
      boardId: section.boardId,
      sectionId: section.id,
      issueMappings: {
        create: {
          userId: userId
        }
      }
    }
  })

  return res.status(201).json({
    success: true,
    message: "issue created successfully",
    data: issue
  })
})

router.get("/issue/:sectionId", authMiddleware, async (req, res) => {
  const sectionId = req.params.sectionId as string
  const userId = req.id

  if (!sectionId) {
    return res.status(400).json({
      success: false,
      error: "sectionId is required"
    })
  }

  const section = await prisma.section.findUnique({
    where: {
      id: sectionId,
      board: {
        org: {
          memberships: {
            some: {
              userId: userId
            }
          }
        }
      }
    },
    select: {
      id: true,
      issues: {
        include: {
          issueMappings: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                }
              }
            }
          },
        },
      }
    }
  })

  if (!section) {
    return res.status(404).json({
      success: false,
      error: "section not found"
    })
  }

  return res.status(200).json({
    success: true,
    message: "issue fetched successfully",
    data: section.issues
  })
})

router.get("/issues", authMiddleware, async (req, res) => {
  const boardId = req.query.boardId
  const userId = req.id

  if (boardId) {
    return res.status(400).json({
      success: false,
      message: "boardId is required"
    })
  }

  const issues = await prisma.issue.findMany({
    where: {
      id: boardId,
      board: {
        org: {
          memberships: {
            some: {
              userId: userId
            }
          }
        }
      }
    },
    include: {
      issueMappings: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
            }
          }
        }
      }
    }
  })

  if (!issues) {
    return res.status(404).json({
      success: false,
      message: "issues not found"
    })
  }

  return res.status(200).json({
    success: false,
    message: "issues fetched successfully",
    data: issues
  })
})

router.patch("/issue/:IssueId", authMiddleware, async (req, res) => {
  const { success, data } = updateIssueSchema.safeParse(req.body)

  if (!success) {
    return res.status(400).json({
      success: false,
      message: "please provide valid inputs"
    })
  }

  const userId = req.id
  const issueId = req.params.IssueId as string

  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
      section: {
        board: {
          org: {
            memberships: {
              some: {
                userId: userId
              }
            }
          }
        }
      }
    },
    include: {
      issueMappings: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
            }
          }
        }
      }
    }
  })

  if (!issue) {
    return res.status(404).json({
      success: false,
      message: "issue not found"
    })
  }

  const updatedIssue = await prisma.issue.update({
    where: {
      id: issue.id
    },
    data: {
      title: data.title,
      description: data.description
    }
  })

  return res.status(200).json({
    success: true,
    message: "issue updated successfully",
    data: {
      title: updatedIssue.title,
      description: updatedIssue.description
    }
  })
})

router.put("/issue/move/:issueId/:sectionId", authMiddleware, async (req, res) => {
  const issueId = req.params.issueId as string
  const newSectionId = req.params.sectionId as string
  const userId = req.id

  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
      board: {
        org: {
          memberships: {
            some: {
              userId: userId
            }
          }
        }
      }
    },
    include: {
      issueMappings: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
            }
          }
        }
      }
    }
  })

  if (!issue) {
    return res.status(404).json({
      success: false,
      message: "issueId is required"
    })
  }

  const section = await prisma.section.findFirst({
    where: {
      id: newSectionId,
      boardId: issue.boardId
    }
  })

  if (!section) {
    return res.status(404).json({
      success: false,
      message: "section not found"
    })
  }

  const updatedIssue = await prisma.issue.update({
    where: {
      id: issueId
    },
    data: {
      sectionId: newSectionId
    }
  })

  return res.status(200).json({
    success: true,
    message: "issue moved successfully",
    data: updatedIssue
  })
})

router.delete("/isssue/:issueId", authMiddleware, async (req, res) => {
  const userId = req.id
  const issueId = req.params.IssueId as string

  if(issueId) {
    return res.status(400).json({
      success: false,
      message: "issueId is required"
    })
  }

  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
      section: {
        board: {
          org: {
            memberships: {
              some: {
                userId: userId
              }
            }
          }
        }
      }
    },
    include: {
      issueMappings: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
            }
          }
        }
      }
    }
  })

  if (!issue) {
    return res.status(404).json({
      success: false,
      message: "issue not found"
    })
  }

  await prisma.issue.delete({
    where: {
      id: issue.id
    }
  })

  return res.status(200).json({
    success: true,
    message: "Issue deleted successfully",
    data: issue
  })
})

export default router
