process.on("uncaughtException", (err) => {
  console.error("[run-all] UNCAUGHT EXCEPTION:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[run-all] UNHANDLED REJECTION:", reason);
});

console.log("[run-all] Starting all consumers...");
console.log("[run-all] NODE_ENV:", process.env.NODE_ENV);
console.log("[run-all] Env vars present: DATABASE_URL=%s, RABBITMQ_URL=%s, QUEUE_NAME=%s, ALERT_QUEUE_NAME=%s",
  !!process.env.DATABASE_URL, !!process.env.RABBITMQ_URL,
  process.env.QUEUE_NAME || "(default)", process.env.ALERT_QUEUE_NAME || "(default)");

import "./consumer";
import "./alert-consumer";

console.log("[run-all] Consumer imports completed");
