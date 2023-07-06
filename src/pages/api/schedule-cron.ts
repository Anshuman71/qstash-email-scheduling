import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { Redis } from "@upstash/redis";

export const QSTASH_CONFIG = {
  QSTASH_URL: process.env.QSTASH_URL,
  QSTASH_TOKEN: process.env.QSTASH_TOKEN,
  QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
};

export const upstash = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const SUMMARY_ENDPOINT = "https://your-domain.com/api/send-email";

export default async function scheduleSummary(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("========SCHEDULE SUMMARY========");
  if (req.method !== "POST") {
    return res.status(400).json({ message: "bad request" });
  }
  const { body } = req;

  const { userId, selectedTime, utcOffset } = body;

  const emailScheduleKey = `email-schedule-${userId}`;

  const scheduleId = await upstash.get(emailScheduleKey);
  if (scheduleId) {
    try {
      await axios.delete(
        `https://qstash.upstash.io/v1/schedules/${scheduleId}`,
        {
          headers: {
            Authorization: `Bearer ${QSTASH_CONFIG.QSTASH_TOKEN}`,
          },
        }
      );
    } catch (e) {
      console.log("Schedule not found in QStash ");
    }
    await upstash.del(emailScheduleKey);
  }

  const [hour, min] = convertToUTC(selectedTime, utcOffset).split(":");
  const selectedCron = `${min} ${hour} * * *`;

  console.log({ selectedCron });

  try {
    const { data, status } = await axios.post(
      `${QSTASH_CONFIG.QSTASH_URL}${SUMMARY_ENDPOINT}`,
      { userId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${QSTASH_CONFIG.QSTASH_TOKEN}`,
          "Upstash-Cron": selectedCron,
        },
      }
    );
    console.log({ data, status });
    if (data.scheduleId) {
      await upstash.set(emailScheduleKey, data.scheduleId);
    }
  } catch (e) {
    console.log({ e });
  }

  return res.status(200).json({ message: "success" });
}

function convertToUTC(timeString: string, utcOffset: number) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const timeInMinutes = hours * 60 + minutes;
  const utcTimeInMinutes = (timeInMinutes + utcOffset + 1440) % 1440;
  const utcHours = Math.floor(utcTimeInMinutes / 60);
  const utcMinutes = utcTimeInMinutes % 60;
  return `${utcHours.toString().padStart(2, "0")}:${utcMinutes
    .toString()
    .padStart(2, "0")}`;
}
