import { prisma } from "db/client";

export const checkAdminRole = async (
  userId: string,
  orgId: string
) => {
  const membership = await prisma.membership.findFirst({
    where: {
      userId: userId,
      orgId: orgId
    }
  })

  return membership?.role === "admin"
}
