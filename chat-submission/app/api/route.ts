import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Message from "@/models/Message";

export async function GET() {
  await connectDB();
  const messages = await Message.find();
  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const message = await Message.create(body);
  return NextResponse.json(message);
}