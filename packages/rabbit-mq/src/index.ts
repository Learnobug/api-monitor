import { getChannel } from "./connection";

const QUEUE_NAME = process.env.QUEUE_NAME ||  "api-monitor";
const ALERT_QUEUE_NAME = process.env.ALERT_QUEUE_NAME || "api-monitor-alerts";

export async function publishJob(data: any) {
  console.log(`[RabbitMQ] Publishing job to ${QUEUE_NAME}:`, JSON.stringify(data));
  const channel = await getChannel();

  await channel.assertQueue(QUEUE_NAME, {
    durable: true
  });

  try {
    channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    );
    console.log(`[RabbitMQ] Job published to ${QUEUE_NAME} successfully`);
    return { ok: true };
  } catch (e) {
    console.error("[RabbitMQ] Error publishing job:", e);
    return { ok: false };
  }
}

export async function consumeJobs(handler: (data: any) => Promise<void>) {
  console.log(`[RabbitMQ] Setting up consumer for ${QUEUE_NAME}`);
  const channel = await getChannel();

  await channel.assertQueue(QUEUE_NAME, {
    durable: true
  });

  console.log(`[RabbitMQ] Waiting for messages on ${QUEUE_NAME}...`);
  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    const raw = msg.content.toString();
    console.log(`[Consumer] Received message from ${QUEUE_NAME}:`, raw);

    try {
      const data = JSON.parse(raw);
      await handler(data);
      channel.ack(msg);
      console.log(`[Consumer] Message processed and acked`);
    } catch (err: any) {
      console.error(`[Consumer] Error processing message:`, err?.message ?? err);
      channel.nack(msg, false, false);
    }
  });
}

export async function publishAlertJob(data: any) {
  console.log(`[RabbitMQ] Publishing alert job to ${ALERT_QUEUE_NAME}`);
  const channel = await getChannel();

  await channel.assertQueue(ALERT_QUEUE_NAME, {
    durable: true,
  });

  try {
    channel.sendToQueue(
      ALERT_QUEUE_NAME,
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    );
    return { ok: true };
  } catch (e) {
    console.log("Error publishing alert job", e);
    return { ok: false };
  }
}

export async function consumeAlertJobs(handler: (data: any) => Promise<void>) {
  console.log(`[RabbitMQ] Setting up consumer for ${ALERT_QUEUE_NAME}`);
  const channel = await getChannel();

  await channel.assertQueue(ALERT_QUEUE_NAME, {
    durable: true,
  });

  console.log(`[RabbitMQ] Waiting for messages on ${ALERT_QUEUE_NAME}...`);
  channel.consume(ALERT_QUEUE_NAME, async (msg) => {
    if (!msg) return;

    const raw = msg.content.toString();
    console.log(`[AlertConsumer] Received message from ${ALERT_QUEUE_NAME}:`, raw);

    try {
      const data = JSON.parse(raw);
      await handler(data);
      channel.ack(msg);
      console.log(`[AlertConsumer] Message processed and acked`);
    } catch (err: any) {
      console.error(`[AlertConsumer] Error processing message:`, err?.message ?? err);
      channel.nack(msg, false, false);
    }
  });
}