import axios from "axios";
import { BaseURL } from "@/BaseURL";

export const sendMessageToChatbot = async (message) => {
  try {
    const res = await axios.post(`${BaseURL}/api/v1/chatbot`, { message });
    return res.data;
  } catch (err) {
    console.error("Chatbot API Error:", err.response?.data || err.message);
    return {
      reply: "I'm having trouble reaching the server.",
      intent: "error",
      confidence: 0,
    };
  }
};
