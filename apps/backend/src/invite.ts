import express from "express"
import { prisma } from "db/client"
import { authMiddleware } from "../middlewares/authMiddleware"
import { acceptInviteSchema, inviteSchema } from "../schema"
import { checkAdminRole } from "../utils/checkAdminRole"
import { sendInviteEmail } from "../utils/sendInviteEmail"

const router = express.Router()

router.post("/invite", authMiddleware, async (req, res) => {
  const { success, data } = inviteSchema.safeParse(req.body)

  if (!success) {
    return res.status(400).json({
      success: false,
      error: "please provide valid inputs"
    })
  }

  const adminId = req.id
  const orgId = data.orgId

  if (!(await checkAdminRole(adminId, orgId))) {
    return res.status(403).json({
      success: false,
      error: "forbidden, you are not an admin of this organization"
    })
  }

  const existingInvitation = await prisma.invitation.findFirst({
    where: {
      email: data.email,
      orgId: data.orgId,
      status: "PENDING"
    }
  })

  if (existingInvitation) {
    return res.status(400).json({
      success: false,
      error: "invitation already exists"
    })
  }

  const invitationToSent = await prisma.invitation.create({
    data: {
      email: data.email,
      orgId: data.orgId,
      userId: adminId,
      status: "PENDING",
      role: "member"
    }
  })

  if(!invitationToSent) {
    return res.status(500).json({
      success: false,
      error: "failed to create invitation"
    })
  }

  const org = await prisma.org.findUnique({
    where: {
      id: data.orgId
    }
  })

  if(!org) {
    return res.status(404).json({
      success: false,
      error: "organization not found"
    })
  }

  //invitation link logic -- can use resend or twilio to send invite link
  const { data: inviteData, error: inviteError} = await sendInviteEmail(data.email, data.orgId, invitationToSent.id)
  
  if (inviteError) {
    return res.status(500).json({
      success: false,
      error: "failed to send invite email"
    })
  }
  
  return res.status(200).json({
    success: true,
    message: "invitation link sent successfully",
    data: inviteData
  })
})

router.post("/accept-invite/:invitationId", authMiddleware, async (req, res) => {
  const { success, data } = acceptInviteSchema.safeParse(req.body)

  if (!success) {
    return res.status(400).json({
      success: false,
      error: "please provide valid inputs"
    })
  }

  const userId = req.id
  const orgId = data.orgId
  const invitationId = req.params.invitationId as string

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId }
  })

  if (!invitation || invitation.status !== "PENDING") {
    return res.status(400).json({
      success: false,
      error: "no pending invitations"
    })
  }
  
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  if (!user || user.email !== invitation.email) {
    return res.status(400).json({
      success: false,
      error: "user not found or email does not match"
    })
  }

  const existingMembership = await prisma.membership.findUnique({
    where: {
      userId_orgId: {
        userId,
        orgId
      }
    }
  })

  if (existingMembership) {
    return res.status(400).json({
      success: false,
      error: "user is already a member of this organization"
    })
  }
  
  //creating a record for this userId and updating the status to "accepted" for this invitation
  
  const [membership] = await prisma.$transaction([
    prisma.membership.create({
      data: { userId: userId, orgId: orgId, role: invitation.role }
    }),
    prisma.invitation.update({
      where: { id: invitation.id }, 
      data: { status: "ACCEPTED" }
    })
  ])

  return res.status(200).json({
    success: true,
    message: "congratulations, you're have been added to the organization successfully",
    data: membership
  })
})

router.get("/membership/:orgId", async (req, res) => {
  const orgId = req.params.orgId as string
  const adminId = req.id

  if (!(await checkAdminRole(adminId, orgId))) {
    return res.status(403).json({
      success: false,
      error: "forbidden, you are not authorized to view this membership"
    })
  }

  const membership = await prisma.membership.findMany({
    where: {
      orgId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        }
      }
    }
  })

  if (!membership) {
    return res.status(404).json({
      success: false,
      error: "membership not found"
    })
  }

  return res.status(200).json({
    success: true,
    data: { membership }
  })
})

router.delete("/membership/:orgId/:userId", async (req, res) => {
  const orgId = req.params.orgId as string
  const userId = req.params.userId as string
  const adminId = req.id

  if (!(await checkAdminRole(adminId, orgId))) {
    return res.status(403).json({
      success: false,
      error: "forbidden, you are not authorized to delete this membership"
    })
  }

  const existingMembership = await prisma.membership.findUnique({
    where: {
      userId_orgId: {
        userId: userId,
        orgId: orgId
      }
    }
  })

  if (!existingMembership) {
    return res.status(404).json({
      success: false,
      error: "membership not found"
    })
  }

  if (existingMembership.role === "admin") {
    const adminCount = await prisma.membership.count({
      where: {
        orgId: orgId,
        role: "admin"
      }
    })

    if (adminCount <= 1) {
      return res.status(400).json({
        success: false,
        error: "cannot delete the last admin"
      })
    }
  }
  
  await prisma.membership.delete({
    where: {
      userId_orgId: {
        userId,
        orgId,
      }
    }
  })

  return res.status(200).json({
    success: true,
    message: "membership deleted successfully"
  })
})

export default router
