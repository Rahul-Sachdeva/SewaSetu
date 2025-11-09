import { queryHuggingFace } from "../Utils/huggingfaceService.js";
import {
  handleEntityNavigation,
  handleDonationIntent,
  handleInfoRequest,
  handleAssistanceIntent,
  handleChatIntent
} from "../Services/chatbotActions.js";

export const chatbotHandler = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?._id || "000000000000000000000000";

    const aiResponse = await queryHuggingFace(message);
   
    const intent = aiResponse.intent || "faq_query";
    let finalResponse = aiResponse;

    switch (intent) {
      case "navigate_to_ngo":
        finalResponse = await handleEntityNavigation(aiResponse.action, "ngo");
        break;

      case "navigate_to_campaign":
        finalResponse = await handleEntityNavigation(aiResponse.action, "campaign");
        break;

      case "donate_campaign":
        finalResponse = await handleDonationIntent(aiResponse.action);
        break;

      case "info_request":
        finalResponse = await handleInfoRequest(aiResponse.action);
        break;

      case "seek_assistance":
        finalResponse = await handleAssistanceIntent(aiResponse.action);
        break;

      case "start_chat":
        finalResponse = await handleChatIntent(aiResponse.action, userId);
        break;

      default:
        break;
    }

    res.json(finalResponse);
  } catch (error) {
    console.error("Chatbot Handler Error:", error);
    res.status(500).json({
      reply: "Sorry, something went wrong while processing your request.",
      intent: "error",
      confidence: 0,
    });
  }
};
