import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  room: String,
  text: String,
  sender: String,
  time: String,
});

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);