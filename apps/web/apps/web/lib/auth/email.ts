import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: 'AI Website Builder <noreply@aiwebsitebuilder.com>',
      to: email,
      subject: 'Welcome to AI Website Builder! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .content { background: #f8fafc; padding: 30px; border-radius: 12px; }
            .button { background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; }
            .feature { margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: #1e293b;">Welcome to AI Website Builder!</h1>
            </div>
            
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>Thank you for joining AI Website Builder! We're excited to help you create amazing websites with the power of AI.</p>
              
              <h3>What you can do now:</h3>
              <div class="feature">🤖 <strong>AI-Powered Content:</strong> Generate professional copy with one click</div>
              <div class="feature">🎨 <strong>Drag & Drop Builder:</strong> Create beautiful layouts visually</div>
              <div class="feature">📱 <strong>Responsive Design:</strong> Your sites work perfectly on all devices</div>
              <div class="feature">🚀 <strong>One-Click Deploy:</strong> Launch instantly to Vercel or Netlify</div>
              
              <p style="margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL}/builder" class="button">Start Building Your First Website</a>
              </p>
              
              <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
                Need help getting started? Check out our <a href="${process.env.NEXTAUTH_URL}/docs">documentation</a> 
                or reply to this email with any questions.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}

export async function sendInvitationEmail(
  email: string, 
  projectName: string, 
  inviterName: string, 
  inviteToken: string
) {
  try {
    await resend.emails.send({
      from: 'AI Website Builder <noreply@aiwebsitebuilder.com>',
      to: email,
      subject: `${inviterName} invited you to collaborate on ${projectName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: #f8fafc; padding: 30px; border-radius: 12px; }
            .button { background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>You're invited to collaborate! 🤝</h2>
              <p><strong>${inviterName}</strong> has invited you to collaborate on the project <strong>"${projectName}"</strong>.</p>
              
              <p>Join them to build amazing websites together using our AI-powered builder.</p>
              
              <p style="margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL}/invite/${inviteToken}" class="button">Accept Invitation</a>
              </p>
              
              <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
                This invitation will expire in 7 days. If you don't have an account yet, 
                you'll be able to create one when you accept the invitation.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('Failed to send invitation email:', error)
  }
}

export async function sendDeploymentNotification(
  email: string,
  projectName: string,
  deploymentUrl: string,
  status: 'success' | 'failed'
) {
  try {
    await resend.emails.send({
      from: 'AI Website Builder <noreply@aiwebsitebuilder.com>',
      to: email,
      subject: `Deployment ${status} for ${projectName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: #f8fafc; padding: 30px; border-radius: 12px; }
            .button-success { background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; }
            .button-retry { background: #ef4444; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              ${status === 'success' ? `
                <h2>🎉 Deployment Successful!</h2>
                <p>Your project <strong>"${projectName}"</strong> has been successfully deployed!</p>
                <p style="margin-top: 30px;">
                  <a href="${deploymentUrl}" class="button-success">View Your Live Website</a>
                </p>
              ` : `
                <h2>❌ Deployment Failed</h2>
                <p>Unfortunately, the deployment of <strong>"${projectName}"</strong> failed.</p>
                <p>Please check your project settings and try again.</p>
                <p style="margin-top: 30px;">
                  <a href="${process.env.NEXTAUTH_URL}/projects" class="button-retry">Try Again</a>
                </p>
              `}
            </div>
          </div>
        </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('Failed to send deployment notification:', error)
  }
}