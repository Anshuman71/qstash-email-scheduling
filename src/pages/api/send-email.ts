import { NextApiRequest, NextApiResponse } from "next";
import { verifySignature } from "@upstash/qstash/nextjs";

async function handler(request: NextApiRequest, res: NextApiResponse) {
  console.log("==========Project summary handler==========");
  if (request.method !== "POST") {
    return res.status(400).json({ message: "bad request" });
  }
  const { body } = request;
  const { userId } = body;

  // prepare and send email

  return res.status(200).json({ message: "success" });
}

export default verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
