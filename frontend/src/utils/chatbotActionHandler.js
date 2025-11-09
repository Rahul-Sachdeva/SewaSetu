// ✅ utils/chatbotActionHandler.js
export const handleChatbotAction = (action, fullResponse, navigate) => {
  console.log("🤖 Chatbot Action:", action);

  switch (action.type) {
    /* -------------------------------------------------------------------------- */
    /* 🚀 1. Page Navigation                                                      */
    /* -------------------------------------------------------------------------- */
    case "navigate":
      if (action.target) {
        console.log("Navigating to:", action.target);
        alert(`Navigating to: ${action.target}`);
        navigate(action.target);
      }
      break;
    case "open_campaign":
  try {
    const { campaignId } = action.parameters || {};
    if (!campaignId) {
      console.warn("⚠️ Missing campaignId for open_campaign action");
      return;
    }

    // Save campaign ID temporarily
    localStorage.setItem("chatbotOpenCampaign", campaignId);

    // Navigate to campaigns page
    navigate("/campaigns");
  } catch (err) {
    console.error("Failed to open campaign:", err);
  }
  break;
  /* -------------------------------------------------------------------------- */
    /* 🧠 2. Prefill Forms (Donation / Assistance)                                */
    /* -------------------------------------------------------------------------- */
    case "prefill_form":
      if (action.form?.defaults) {
        const defaults = action.form.defaults;

        // 🧹 Clean empty fields
        const cleanedData = Object.entries(defaults).reduce((acc, [key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {});

        // 💾 Store and notify
        if(action.target==="/donate"){
            localStorage.setItem("prefillForm", JSON.stringify(cleanedData));
        }
        else{
            localStorage.setItem("prefillRequestForm", JSON.stringify(cleanedData));
        }

        // 🪄 Dispatch a custom event to notify currently active page
        window.dispatchEvent(new Event("chatbotPrefill"));

        alert("✅ Some fields have been automatically filled for you!");
        navigate(action.target || "/donate");
      }
      break;

    /* -------------------------------------------------------------------------- */
    /* ℹ️ 3. Show Information (for NGO or campaign info_request)                  */
    /* -------------------------------------------------------------------------- */
    case "show_info":
      if (fullResponse.reply) {
        alert(fullResponse.reply);
      } else {
        alert("Here's some information about your query.");
      }
      break;

    /* -------------------------------------------------------------------------- */
    /* 🪟 4. Modal or Unsupported Actions                                         */
    /* -------------------------------------------------------------------------- */
    case "open_modal":
      alert("This feature (modal) will be available soon!");
      break;

    /* -------------------------------------------------------------------------- */
    /* ⚠️ 5. Fallback Handler                                                    */
    /* -------------------------------------------------------------------------- */
    default:
      console.warn("⚠️ Unknown chatbot action:", action);
  }
};
