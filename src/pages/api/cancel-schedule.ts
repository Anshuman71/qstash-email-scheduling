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

export default async function scheduleSummary(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log("========REMOVE SCHEDULE SUMMARY========");
    if (req.method !== "POST") {
        return res.status(400).json({ message: "bad request" });
    }
    const { body } = req;

    const { userId } = body;

    const emailScheduleKey = `email-schedule-${userId}`;

    const scheduleId = await upstash.get(emailScheduleKey);

    // remove existing schedule before creating a new one
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


    return res.status(200).json({ message: "success" });
}
