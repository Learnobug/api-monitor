import amqp from "amqplib";

const url = process.env.RABBITMQ_URL!;

let cachedConnection: amqp.ChannelModel | null = null;
let cachedChannel: amqp.Channel | null = null;

export async function getChannel(): Promise<amqp.Channel> {
  if (cachedChannel) return cachedChannel;

  cachedConnection = await amqp.connect(url);
  cachedChannel = await cachedConnection.createChannel();

  cachedConnection.on("error", () => {
    cachedConnection = null;
    cachedChannel = null;
  });
  cachedConnection.on("close", () => {
    cachedConnection = null;
    cachedChannel = null;
  });

  return cachedChannel;
}