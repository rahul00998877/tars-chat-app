import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!mongoose.connections[0].readyState) {
  mongoose.connect(MONGODB_URI);
}

const MessageSchema = new mongoose.Schema({
  room: String,
  text: String,
  sender: String,
  time: String,
});

const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const messages = await Message.find();
    return res.status(200).json(messages);
  }

  if (req.method === "POST") {
    const message = await Message.create(req.body);
    return res.status(201).json(message);
  }

  res.status(405).end();
}