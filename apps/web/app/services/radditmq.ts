import "server-only";
import { publishJob } from "@repo/rabbit-mq/index";

export async function enqueueApiCheckJob(url: string, monitorID: string, trigger: "manual" | "cron" = "manual") {
    await publishJob({ url, monitorID, trigger });
}