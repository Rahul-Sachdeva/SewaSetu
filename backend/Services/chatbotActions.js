import { NGO } from "../Models/ngo.model.js";
import { Campaign } from "../Models/campaign.model.js";
import { AssistanceRequest } from "../Models/assistance.model.js";
import { Conversation } from "../Models/conversation.model.js";
import Fuse from "fuse.js";
import mongoose from "mongoose";

/* -------------------------------------------------------------------------- */
/* 🧠 1. Entity Navigation Handler (already robust)                            */
/* -------------------------------------------------------------------------- */

export const handleEntityNavigation = async (action, entityType) => {
  const { parameters = {} } = action;
  const searchTerm =
    (entityType === "ngo" ? parameters.ngoName : parameters.campaignName) || "";

  if (!searchTerm.trim()) {
    return {
      reply: `Please specify which ${entityType} you want to view.`,
      intent: "clarification_needed",
      confidence: 0.5,
    };
  }

  const cleanedSearch = searchTerm
    .replace(/ngo|foundation|organization|trust|society/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const entities =
    entityType === "ngo"
      ? await NGO.find({}, { name: 1, _id: 1 })
      : await Campaign.find({}, { title: 1, _id: 1 });

  if (!entities.length) {
    return {
      reply: `No ${entityType}s found currently.`,
      intent: `navigate_to_${entityType}`,
      action: {
        type: "navigate",
        target: entityType === "ngo" ? "/ngo-list" : "/campaigns",
      },
      confidence: 0.8,
    };
  }

  const fuse = new Fuse(entities, {
    keys: entityType === "ngo" ? ["name"] : ["title"],
    threshold: 0.4,
  });

  const results = fuse.search(cleanedSearch);
  const matched = results[0]?.item;

  if (!matched) {
    return {
      reply: `I couldn't find that ${entityType}. Redirecting you to ${entityType === "ngo" ? "NGO list" : "campaigns"} page.`,
      intent: "fallback_navigation",
      action: {
        type: "navigate",
        target: entityType === "ngo" ? "/ngo-list" : "/campaigns",
      },
      confidence: 0.8,
    };
  }

  if(entityType==="ngo"){
      return {
        reply: `Opening ${matched.name || matched.title}'s page.`,
        intent: `navigate_to_${entityType}`,
        action: {
          type: "navigate",
          entity: entityType,
          target: `/${entityType}/${matched._id}`,
          parameters: {
            [entityType === "ngo" ? "ngoName" : "campaignName"]:
              matched.name || matched.title,
          },
        },
        confidence: 0.95,
      };
    }
    return {
      reply: `Opening ${matched.name || matched.title}'s page.`,
      intent: `view_campaign`,
      action: {
        type: "open_campaign",
        entity: entityType,
        target: `/campaigns`,
        parameters: {
          [entityType === "ngo" ? "ngoName" : "campaignName"]:
            matched.name || matched.title,
            "campaignId": matched._id,
        },
      },
      confidence: 0.95,
    };
};

/* -------------------------------------------------------------------------- */
/* 💸 2. Donation Intent (with fuzzy NGO match)                               */
/* -------------------------------------------------------------------------- */

export const handleDonationIntent = async (action) => {
  const { parameters = {} } = action;
  const ngoName = parameters.ngoName || "";
  const amount = parameters.amount || "";
  const itemType = parameters.type || "General";
  const pickupLocation = parameters.location || "";
  const title = parameters.title || "";
  const description = parameters.description || "";
  const quantity = parameters.quantity || 0;

  const donationDefaults = {
    name: "",
    phone: "",
    email: "",
    location: pickupLocation,
    type: itemType,
    title: title || `${itemType} Donation`,
    description: description,
    quantity: quantity,
    pickupDate: new Date().toISOString().split("T")[0],
    pickupTime: "10:00",
  };

  // 🧠 Apply fuzzy matching for NGO name
  let ngo = null;
  if (ngoName) {
    const ngos = await NGO.find({}, { name: 1, _id: 1, email: 1 });
    const fuse = new Fuse(ngos, { keys: ["name"], threshold: 0.4 });
    const results = fuse.search(
      ngoName.replace(/ngo|foundation|organization|trust|society/gi, "").trim()
    );
    ngo = results[0]?.item || null;
  }

  if (!ngo) {
    return {
      reply: "Opening donation page.",
      intent: "donate_campaign",
      action: {
        type: "prefill_form",
        target: "/donate",
        form: { defaults: donationDefaults },
      },
      confidence: 0.8,
    };
  }

  donationDefaults.description =
    description || `Donation towards ${ngo.name}`;
  donationDefaults.email = ngo.email || "";

  return {
    reply: `Prefilling donation form for ${ngo.name}.`,
    intent: "donate_campaign",
    action: {
      type: "prefill_form",
      entity: "ngo",
      target: "/donate",
      parameters: { ngoName: ngo.name },
      form: { defaults: donationDefaults },
    },
    confidence: 0.95,
  };
};

/* -------------------------------------------------------------------------- */
/* ℹ️ 3. Info Request (with fuzzy NGO matching)                               */
/* -------------------------------------------------------------------------- */

export const handleInfoRequest = async (action) => {
  const { parameters = {} } = action;
  const ngoName = parameters.ngoName || "";

  if (!ngoName.trim()) {
    return {
      reply: "Please tell me which NGO you want details about.",
      intent: "info_request",
      confidence: 0.5,
    };
  }

  const ngos = await NGO.find({}, { name: 1, city: 1, category: 1, description: 1, _id: 1 });
  const fuse = new Fuse(ngos, { keys: ["name"], threshold: 0.4 });
  const results = fuse.search(
    ngoName.replace(/ngo|foundation|organization|trust|society/gi, "").trim()
  );
  const matched = results[0]?.item;

  if (!matched) {
    return {
      reply: "I couldn’t find that NGO.",
      intent: "info_request",
      confidence: 0.6,
    };
  }

  return {
    reply: `Here’s some info on ${matched.name}:\nCity: ${matched.city}\nCategory: ${matched.category.join(
      ", "
    )}\nDescription: ${matched.description || "No description provided."}`,
    intent: "info_request",
    action: {
      type: "show_info",
      entity: "ngo",
      parameters: { id: matched._id, ngoName: matched.name },
    },
    confidence: 0.9,
  };
};

/* -------------------------------------------------------------------------- */
/* 🆘 4. Assistance Intent (no fuzzy needed, but cleaned)                     */
/* -------------------------------------------------------------------------- */

export const handleAssistanceIntent = async (action) => {
  const { form = {} } = action;
  const { defaults = {} } = form;
  const { category, description, location, priority } = defaults;

  const assistanceDefaults = {
    name: "",
    phone: "",
    email: "",
    address: location,
    category: category,
    description: description || "Help requested via chatbot.",
    priority: priority || "Normal",
  };

  return {
    reply: `Created a draft assistance request for ${assistanceDefaults.category}.`,
    intent: "seek_assistance",
    action: {
      type: "prefill_form",
      entity: "request",
      target: `/request/`,
      form: { defaults: assistanceDefaults },
    },
    confidence: 0.9,
  };
};

/* -------------------------------------------------------------------------- */
/* 💬 5. Chat Intent (with fuzzy NGO matching)                                */
/* -------------------------------------------------------------------------- */

export const handleChatIntent = async (action, userId) => {
  const { parameters = {} } = action;
  const ngoName = parameters.ngoName || "";

  if (!ngoName.trim()) {
    return {
      reply: "Please specify which NGO you'd like to chat with.",
      intent: "start_chat",
      confidence: 0.5,
    };
  }

  const ngos = await NGO.find({}, { name: 1, account: 1 });
  const fuse = new Fuse(ngos, { keys: ["name"], threshold: 0.4 });
  const results = fuse.search(
    ngoName.replace(/ngo|foundation|organization|trust|society/gi, "").trim()
  );
  const matched = results[0]?.item;

  if (!matched) {
    return {
      reply: "I couldn’t find that NGO to start a chat.",
      intent: "start_chat",
      confidence: 0.7,
    };
  }

  const receiverId = new mongoose.Types.ObjectId(matched.account);
  let conversation = await Conversation.findOne({
    type: "private",
    "participants.participant": { $all: [userId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      type: "private",
      participants: [
        { participantType: "User", participant: userId },
        { participantType: "NGO", participant: receiverId },
      ],
    });
  }

  return {
    reply: `Opening chat with ${matched.name}.`,
    intent: "start_chat",
    action: {
      type: "navigate",
      entity: "chat",
      target: `/chat/${conversation._id}`,
      parameters: { ngoName: matched.name },
    },
    confidence: 0.95,
  };
};
