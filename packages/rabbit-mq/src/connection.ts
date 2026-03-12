import amqp from "amqplib";

const url = process.env.RABBITMQ_URL;

let cachedConnection: amqp.ChannelModel | null = null;
let cachedChannel: amqp.Channel | null = null;

export async function getChannel(): Promise<amqp.Channel> {
  if (cachedChannel) return cachedChannel;

  if (!url) {
    throw new Error("[RabbitMQ] RABBITMQ_URL is not set");
  }

  console.log("[RabbitMQ] Connecting to", url.replace(/\/\/.*@/, "//***@"));
  cachedConnection = await amqp.connect(url);
  console.log("[RabbitMQ] Connected successfully");
  cachedChannel = await cachedConnection.createChannel();
  console.log("[RabbitMQ] Channel created");

  cachedConnection.on("error", (err) => {
    console.error("[RabbitMQ] Connection error:", err.message);
    cachedConnection = null;
    cachedChannel = null;
  });
  cachedConnection.on("close", () => {
    console.log("[RabbitMQ] Connection closed");
    cachedConnection = null;
    cachedChannel = null;
  });

  return cachedChannel;
}