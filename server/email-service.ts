import { serverLogger } from "./_core/logger-wiring";

/**
 * Email Service Integration
 * Supports SendGrid, SMTP, and built-in notification system
 */


export interface EmailOptions {
  to: string | string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

/**
 * Send email via configured service
 * Priority: SendGrid > SMTP > Built-in Notifications
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Try SendGrid first
    if (process.env.SENDGRID_API_KEY) {
      return await sendViaSendGrid(options);
    }

    // Fall back to SMTP
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    ) {
      return await sendViaSMTP(options);
    }

    // Fall back to built-in notifications
    return await sendViaNotifications(options);
  } catch (error) {
    serverLogger.error("[Email Service] Failed to send email:", error);
    return false;
  }
}

// Fallback: use built-in notification system if no email service is configured
export const useBuiltInNotifications = true;

/**
 * Send via SendGrid API
 */
async function sendViaSendGrid(options: EmailOptions): Promise<boolean> {
  try {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: recipients.map(email => ({
          to: [{ email }],
        })),
        from: {
          email: process.env.SENDER_EMAIL || "noreply@isa-hub.com",
          name: "ISA Hub",
        },
        subject: options.subject,
        content: [
          {
            type: "text/html",
            value: options.htmlContent,
          },
          ...(options.textContent
            ? [
                {
                  type: "text/plain",
                  value: options.textContent,
                },
              ]
            : []),
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      serverLogger.error("[SendGrid] Error:", error);
      return false;
    }

    serverLogger.info("[SendGrid] Email sent successfully", {
      recipientCount: recipients.length,
    });
    return true;
  } catch (error) {
    serverLogger.error("[SendGrid] Failed to send email:", error);
    return false;
  }
}

/**
 * Send via SMTP (using Nodemailer)
 */
async function sendViaSMTP(options: EmailOptions): Promise<boolean> {
  try {
    // Dynamic import to avoid dependency if not using SMTP
    // @ts-ignore - nodemailer is optional
    const nodemailer = await import("nodemailer");

    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true" || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const recipients = Array.isArray(options.to)
      ? options.to.join(",")
      : options.to;

    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL || "noreply@isa-hub.com",
      to: recipients,
      subject: options.subject,
      html: options.htmlContent,
      text: options.textContent,
    });

    serverLogger.info("[SMTP] Email sent successfully", {
      messageId: info.messageId,
    });
    return true;
  } catch (error) {
    serverLogger.error("[SMTP] Failed to send email:", error);
    return false;
  }
}

/**
 * Send via built-in notification system
 */
async function sendViaNotifications(options: EmailOptions): Promise<boolean> {
  try {
    const { notifyOwner } = await import("./_core/notification");

    const recipients = Array.isArray(options.to)
      ? options.to.join(", ")
      : options.to;

    await notifyOwner({
      title: options.subject,
      content: `To: ${recipients}\n\n${options.textContent || options.htmlContent}`,
    });

    serverLogger.info("[Notifications] Email sent via built-in system");
    return true;
  } catch (error) {
    serverLogger.error("[Notifications] Failed to send email:", error);
    return false;
  }
}

/**
 * Email Template: Deadline Alert
 */
export function createDeadlineAlertEmail(
  regulationName: string,
  deadline: Date,
  daysUntil: number
): EmailOptions {
  const deadlineStr = deadline.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    to: ["frisowempe@gmail.com", "friso.wempe@gs1.nl"],
    subject: `⚠️ Upcoming Deadline: ${regulationName} (${daysUntil} days)`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Regulatory Deadline Alert</h1>
        </div>
        <div style="padding: 20px; background-color: #f9fafb;">
          <p>Dear ISA User,</p>
          <p>This is a reminder that the following regulation has an upcoming implementation deadline:</p>
          
          <div style="background-color: white; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1f2937;">${regulationName}</h2>
            <p style="font-size: 18px; color: #f59e0b; font-weight: bold;">
              Implementation Date: ${deadlineStr}
            </p>
            <p style="color: #6b7280;">
              Time remaining: <strong>${daysUntil} days</strong>
            </p>
          </div>

          <p>We recommend reviewing your compliance status and implementation plan to ensure timely adherence to this regulation.</p>
          
          <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;">
              <strong>Next Steps:</strong>
            </p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #1e40af;">
              <li>Review the regulation details in the ESG Hub</li>
              <li>Check your implementation checklist</li>
              <li>Verify GS1 standards compliance</li>
              <li>Contact your compliance team</li>
            </ul>
          </div>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            This is an automated message from ISA Hub. You are receiving this because you have set alerts for this regulation.
          </p>
        </div>
      </div>
    `,
    textContent: `
Regulatory Deadline Alert

${regulationName}
Implementation Date: ${deadlineStr}
Time remaining: ${daysUntil} days

This is a reminder that the above regulation has an upcoming implementation deadline.

Next Steps:
- Review the regulation details in the ESG Hub
- Check your implementation checklist
- Verify GS1 standards compliance
- Contact your compliance team

---
This is an automated message from ISA Hub.
    `,
  };
}

/**
 * Email Template: Daily Digest
 */
export function createDailyDigestEmail(
  newRegulations: Array<{ name: string; code: string }>,
  newNews: Array<{ title: string; summary: string }>,
  upcomingDeadlines: Array<{ name: string; daysUntil: number }>
): EmailOptions {
  return {
    to: ["frisowempe@gmail.com", "friso.wempe@gs1.nl"],
    subject: "📋 ISA Hub Daily Digest - ESG Regulatory Updates",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">ISA Hub Daily Digest</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your daily ESG regulatory update</p>
        </div>
        <div style="padding: 20px; background-color: #f9fafb;">
          <p>Dear ISA User,</p>
          <p>Here's your daily summary of ESG regulatory developments:</p>

          ${
            newRegulations.length > 0
              ? `
            <div style="background-color: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">🆕 New Regulations (${newRegulations.length})</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${newRegulations.map(reg => `<li style="margin: 5px 0; color: #374151;">${reg.code}: ${reg.name}</li>`).join("")}
              </ul>
            </div>
          `
              : ""
          }

          ${
            newNews.length > 0
              ? `
            <div style="background-color: white; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">📰 Latest News (${newNews.length})</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${newNews
                  .map(
                    news => `
                  <li style="margin: 10px 0; color: #374151;">
                    <strong>${news.title}</strong><br>
                    <span style="color: #6b7280; font-size: 14px;">${news.summary}</span>
                  </li>
                `
                  )
                  .join("")}
              </ul>
            </div>
          `
              : ""
          }

          ${
            upcomingDeadlines.length > 0
              ? `
            <div style="background-color: white; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">⏰ Upcoming Deadlines (${upcomingDeadlines.length})</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${upcomingDeadlines
                  .map(
                    deadline => `
                  <li style="margin: 5px 0; color: #374151;">
                    ${deadline.name} - <strong>${deadline.daysUntil} days</strong>
                  </li>
                `
                  )
                  .join("")}
              </ul>
            </div>
          `
              : ""
          }

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            This is an automated message from ISA Hub. Visit the ESG Hub to view all regulations and customize your alerts.
          </p>
        </div>
      </div>
    `,
    textContent: `
ISA Hub Daily Digest - ESG Regulatory Updates

${
  newRegulations.length > 0
    ? `
NEW REGULATIONS (${newRegulations.length})
${newRegulations.map(reg => `- ${reg.code}: ${reg.name}`).join("\n")}

`
    : ""
}${
      newNews.length > 0
        ? `
LATEST NEWS (${newNews.length})
${newNews.map(news => `- ${news.title}\n  ${news.summary}`).join("\n")}

`
        : ""
    }${
      upcomingDeadlines.length > 0
        ? `
UPCOMING DEADLINES (${upcomingDeadlines.length})
${upcomingDeadlines.map(deadline => `- ${deadline.name} (${deadline.daysUntil} days)`).join("\n")}

`
        : ""
    }
---
This is an automated message from ISA Hub.
    `,
  };
}

/**
 * Email Template: Regulation Update Notification
 */
export function createRegulationUpdateEmail(
  regulationName: string,
  changeType: string,
  changeDescription: string
): EmailOptions {
  return {
    to: ["frisowempe@gmail.com", "friso.wempe@gs1.nl"],
    subject: `🔔 Update: ${regulationName} - ${changeType}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #8b5cf6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Regulation Update</h1>
        </div>
        <div style="padding: 20px; background-color: #f9fafb;">
          <p>Dear ISA User,</p>
          <p>An important update has been detected for a regulation you're tracking:</p>
          
          <div style="background-color: white; border-left: 4px solid #8b5cf6; padding: 15px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1f2937;">${regulationName}</h2>
            <p style="font-size: 16px; color: #8b5cf6; font-weight: bold;">
              Change Type: ${changeType}
            </p>
            <p style="color: #374151; line-height: 1.6;">
              ${changeDescription}
            </p>
          </div>

          <p style="color: #6b7280;">
            Please review the updated regulation details in the ESG Hub to ensure your compliance plan remains current.
          </p>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            This is an automated message from ISA Hub.
          </p>
        </div>
      </div>
    `,
    textContent: `
Regulation Update: ${regulationName}

Change Type: ${changeType}

${changeDescription}

Please review the updated regulation details in the ESG Hub to ensure your compliance plan remains current.

---
This is an automated message from ISA Hub.
    `,
  };
}
