import "server-only";
import { publishJob } from "@repo/rabbit-mq/index";

export async function enqueueApiCheckJob(
    url: string,
    monitorID: string,
    trigger: "manual" | "cron" = "manual",
    options?: { method?: string; body?: string | null; bodyType?: string | null; headers?: any }
) {
    await publishJob({
        url,
        monitorID,
        trigger,
        method: options?.method ?? "GET",
        body: options?.body ?? null,
        bodyType: options?.bodyType ?? "none",
        headers: options?.headers ?? null,
    });
}