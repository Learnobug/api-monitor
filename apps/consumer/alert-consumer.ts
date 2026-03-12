import { consumeAlertJobs } from "@repo/rabbit-mq";
import { prisma } from "@repo/database";
import Mailjet from "node-mailjet";

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC!,
  process.env.MJ_APIKEY_PRIVATE!,
);

console.log("[AlertConsumer] Starting alert consumer...");
console.log("[AlertConsumer] MJ_APIKEY_PUBLIC set:", !!process.env.MJ_APIKEY_PUBLIC);
console.log("[AlertConsumer] MJ_APIKEY_PRIVATE set:", !!process.env.MJ_APIKEY_PRIVATE);

consumeAlertJobs(async (job: any) => {
  const { alertId, checkId, email, apiName, apiUrl, status, error } = job;

  console.log(`Sending alert email to ${email} for ${apiName}`);

  let sendError: string | undefined;

  try {
    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: { Email: "gunjanaggarwal597@gmail.com", Name: "API Monitor" },
          To: [{ Email: email }],
          Subject: `[API Monitor Alert] ${apiName} is failing`,
          HTMLPart: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">API Alert: ${apiName}</h2>
              <p>Your monitored API endpoint is experiencing issues:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Endpoint</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${apiUrl}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Status Code</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${status}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Error</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${error || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Time</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date().toISOString()}</td>
                </tr>
              </table>
              <p style="color: #6b7280; font-size: 12px;">— API Monitor</p>
            </div>
          `,
        },
      ],
    });
    console.log(`Alert email sent to ${email}`);
  } catch (err: any) {
    sendError = err?.message ?? "Failed to send email";
    console.error(`Failed to send alert email to ${email}:`, sendError);
  }

  // Log the alert send attempt
  await prisma.alertLog.create({
    data: {
      alertId,
      checkId,
      error: sendError,
    },
  });
});
