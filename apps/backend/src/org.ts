import express from "express"
import { createOrgSchema, updateOrgSchema } from "../schema"
import { prisma } from "db/client"
import { authMiddleware } from "../middlewares/authMiddleware"
import { checkAdminRole } from "../utils/checkAdminRole"

const router = express.Router()

router.post("organization/create", authMiddleware, async (req, res) => {
  const { success, data } = createOrgSchema.safeParse(req.body) 
  
  if (!success) {
    return res.status(400).json({
        success: false,
        error: "please provide valid inputs"
      })
  }

  const userId = req.id

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: "user not found"
    })
  }

  const org = await prisma.org.create({
    data: {
      name: data.name,
      description: data.description
    }
  })

  await prisma.membership.create({
    data: {
      userId: userId,
      orgId: org.id,
      role: "admin"
    }
  })

  return res.status(201).json({
    success: true,
    message: "organization created successfully"
  })
})

router.get("/organizations", authMiddleware, async (req, res) => {
  const userId = req.id

  const membership = await prisma.membership.findMany({
    where: {
      id: userId
    },
    include: {
      org: true
    }
  })

  if (!membership) {
    return res.status(403).json({
      success: false,
      error: "forbidden, membership not found in any of the organization"
    })
  }
  return res.status(200).json({
      success: true,
      message: "fetched your membership successfully",
      data: membership
    })
})

router.patch("organization/:orgId", authMiddleware, async (req, res) => {
  const {success, data } = updateOrgSchema.safeParse(req.body) 

  if (!success) {
    return res.status(400).json({
        success: false,
        error: "please provide valid inputs"
      })
  }

  const orgId = req.params.orgId as string
  const userId = req.id
  
  const org = await prisma.org.findUnique({
    where: {
      id: orgId
    }
  })

  if (!org) {
    return res.status(400).json({
      success: false,
      message: "organization not found"
    })
  }

  if (!(await checkAdminRole(userId, orgId))) {
    return res.status(403).json({
      success: false,
      error: "forbidden, you don't have access to modify this resource"
    })
  }
  
  const updatedOrg = await prisma.org.update({
    where: {
      id: orgId
    },
    data: {
      name: data.name,
      description: data.description
    }
  })

  return res.status(200).json({
    success: true,
    message: "organization updated successfully",
    data: updatedOrg
  })
})

router.delete("/organization/:orgId", authMiddleware, async (req, res) => {
  const orgId = req.params.orgId as string
  const userId = req.id

  const org = await prisma.org.findUnique({
    where: {
      id: orgId
    }
  })

  if (!org) {
    return res.status(404).json({
      success: false,
      error: "organization not found"
    })
  }

  if (!(await checkAdminRole(userId, orgId))) {
    return res.status(403).json({
      success: false,
      error: "forbidden, you don't have access to modify this resource"
    })
  }

  await prisma.org.delete({
    where: {
      id: orgId
    }
  })

  return res.status(200).json({
    success: true,
    message: "organization deleted successfully"
  })
})

export default router