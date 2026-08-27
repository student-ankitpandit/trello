import { Resend } from "resend"

const RESEND_API_KEY = process.env.RESEND_API_KEY
if(!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set in .env")

const resend = new Resend(RESEND_API_KEY)

export async function sendInviteEmail(to: string, orgId: string, invitationCode: string): Promise<{ data: any; error: any }> {
  try {
    const { data, error} = await resend.emails.send({
      from: "trello <invites@resend.dev>",
      to,
      subject: `You have been invited to join ${orgId}`,
      html: `<p>You have been invited to join <strong>${orgId}</strong>. Sign in , choose "Join the Organization" and paste this invitation code:</p><p><code>${invitationCode}</code></p>`
    })

    if (error) {
      console.error("Failed to send invite email", error)
      return { data: null, error }
    }

    console.log("Invite email sent successfully", data)
    return { data, error: null }
  } catch (e) {
    console.error("Failed to send invite email", e)
    return { data: null, error: e }
  }
}