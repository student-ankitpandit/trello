import express from "express"
import { prisma } from "db/client"
import { authMiddleware } from "../middlewares/authMiddleware"
import { acceptInviteSchema, inviteSchema } from "../schema"
import { checkAdminRole } from "../utils/checkAdminRole"

const router = express.Router()

router.post("/invite", authMiddleware, async (req, res) => {
  const { success, data } = inviteSchema.safeParse(req.body)

  if (!success) {
    return res.status(400).json({
      success: false,
      error: "please provide valid inputs"
    })
  }

  const userId = req.id
  const orgId = data.orgId

  if (!(await checkAdminRole(userId, orgId))) {
    return res.status(403).json({
      success: false,
      error: "you are not an admin of this organization"
    })
  }

  //invitation link logic -- can use resend or twilio to send invite link

  return res.status(200).json({
    success: true,
    message: "invitation link sent successfully"
  })
})

router.post("/accept-invite", authMiddleware, async (req, res) => {
  const { success, data } = acceptInviteSchema.safeParse(req.body)

  if (!success) {
    return res.status(400).json({
      success: false,
      error: "please provide valid inputs"
    })
  }

  const userId = req.id
  const orgId = data.orgId
  const userEmail = req.email

  const invitation = await prisma.invitation.findUnique({
    where: {
      email_orgId: {
          email: userEmail,
          orgId: orgId
        }
      }
    })

  if (!invitation || invitation.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        error: "no pending invitations"
      })
  }

  // user exist and that too with status only "accepted or "rejected"

  //create a record for this particular userId and updating the status to "accepted" for that particular invitationId
  
  const [membership] = await prisma.$transaction([
    prisma.membership.create({
      data: { userId: userId, orgId: orgId, role: invitation.role }
    }),
    prisma.invitation.update({
      where: { id: invitation.id }, 
      data: { status: "ACCEPTED" }
    })
  ])

  return res.status(201).json({
    success: true,
    message: "congratulations, you're have been added to the organization successfully",
    data: membership
  })
})

export default router
