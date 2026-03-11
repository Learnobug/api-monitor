import { getChannel } from "./connection";

const QUEUE_NAME = process.env.QUEUE_NAME ||  "api-monitor";
const ALERT_QUEUE_NAME = process.env.ALERT_QUEUE_NAME || "api-monitor-alerts";

export async function publishJob(data: any) {
  const channel = await getChannel();

  await channel.assertQueue(QUEUE_NAME, {
    durable: true
  });

  try{
  channel.sendToQueue(
    QUEUE_NAME,
    Buffer.from(JSON.stringify(data)),
    { persistent: true }
  );
  return {ok:true};
}catch(e){
  console.log("Error occur while inserting in queue",e);
  return {ok:false};
}
}

export async function consumeJobs(handler: (data: any) => Promise<void>) {
  const channel = await getChannel();

  await channel.assertQueue(QUEUE_NAME, {
    durable: true
  });

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString());

    await handler(data);

    channel.ack(msg);
  });
}

export async function publishAlertJob(data: any) {
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
  const channel = await getChannel();

  await channel.assertQueue(ALERT_QUEUE_NAME, {
    durable: true,
  });

  channel.consume(ALERT_QUEUE_NAME, async (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString());

    await handler(data);

    channel.ack(msg);
  });
}