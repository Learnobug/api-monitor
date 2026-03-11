import amqp from "amqplib";

const url = process.env.RABBITMQ_URL!;

export async function getChannel() {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();
  return channel;
}