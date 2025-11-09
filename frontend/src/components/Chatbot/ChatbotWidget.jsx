import React, { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { sendMessageToChatbot } from "@/api/chatbotApi";
import { handleChatbotAction } from "@/utils/chatbotActionHandler";
import { useNavigate } from "react-router-dom";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voice, setVoice] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [firstOpen, setfirstOpen] = useState(true);

  const navigate = useNavigate();
  const widgetRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Position state (bottom, right)
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("chatbotPosition");
    return saved ? JSON.parse(saved) : { bottom: 16, right: 16 };
  });

  /* -------------------------------------------------------------------------- */
  /* 🎙️ Load female voice                                                      */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const loadVoices = () => {
      const voices = synthRef.current.getVoices();
      const female =
        voices.find((v) =>
          /(female|woman|Google UK English Female|en-GB|en-US)/i.test(v.name)
        ) || voices.find((v) => v.lang.startsWith("en"));
      setVoice(female || voices[0]);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 👋 Welcome message                                                         */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = {
        role: "assistant",
        content:
          "👋 Hello! I’m the Sewa Setu Assistant\n\nI can help you with:\n• Navigating NGO or Campaign pages\n• Prefilling Donation or Help Request forms\n• Providing Information & FAQs\n\nYou can type or speak your query — I’ll handle the rest.",
      };
      setMessages([welcome]);
      if(firstOpen){
        speakText(welcome.content);
        setfirstOpen(false);
      }
    }
  }, [isOpen, voice]);

  /* -------------------------------------------------------------------------- */
  /* 🗣️ Speech synthesis helper                                                */
  /* -------------------------------------------------------------------------- */
  const speakText = (text) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = voice;
    utter.pitch = 1.1;
    utter.rate = 0.95;
    synthRef.current.speak(utter);
  };
  const stopSpeaking = () => synthRef.current.cancel();

  /* -------------------------------------------------------------------------- */
  /* 🎧 Speech recognition (mic input)                                          */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!listening) return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    return () => recognition.abort();
  }, [listening]);

  /* -------------------------------------------------------------------------- */
  /* 💬 Send message                                                           */
  /* -------------------------------------------------------------------------- */
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await sendMessageToChatbot(input);
      const botMessage = { role: "assistant", content: response.reply };
      setMessages((prev) => [...prev, botMessage]);
      speakText(response.reply);

      if (response?.action && response.confidence >= 0.7) {
        handleChatbotAction(response.action, response, navigate);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Sorry, something went wrong." },
      ]);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🧱 Smooth draggable (relative to bottom-right)                              */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;

    let startX, startY, startBottom, startRight, moved = false;

    const onMouseDown = (e) => {
      startX = e.clientX;
      startY = e.clientY;
      startBottom = position.bottom;
      startRight = position.right;
      moved = false;

      const onMouseMove = (e2) => {
        const deltaX = e2.clientX - startX;
        const deltaY = e2.clientY - startY;
        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) moved = true;
        const newRight = Math.max(0, startRight - deltaX);
        const newBottom = Math.max(0, startBottom - deltaY);
        setPosition({ bottom: newBottom, right: newRight });
      };

      const onMouseUp = (eUp) => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        localStorage.setItem(
          "chatbotPosition",
          JSON.stringify({ bottom: position.bottom, right: position.right })
        );

        // Only open if it was a click (not a drag)
        if (!moved && !isOpen) setIsOpen(true);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    widget.addEventListener("mousedown", onMouseDown);
    return () => widget.removeEventListener("mousedown", onMouseDown);
  }, [position, isOpen]);

  const closeChat = () => {
    setIsOpen(false);
    stopSpeaking();
  }

  /* -------------------------------------------------------------------------- */
  /* 🪟 UI                                                                     */
  /* -------------------------------------------------------------------------- */
  return (
    <div
      ref={widgetRef}
      className="z-50 select-none"
      style={{
        position: "fixed",
        bottom: position.bottom,
        right: position.right,
        width: isOpen ? "380px" : "90px",
        height: isOpen ? "480px" : "90px",
        transition: "all 0.25s ease",
        borderRadius: isOpen ? "16px" : "20%",
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        cursor: "move",
      }}
    >
      {!isOpen ? (
        <button
          className="bg-indigo-600 p-2 text-white w-full h-full flex items-center justify-center hover:bg-indigo-700 transition"
          title="Open Chat"
        >
          <img 
          src="/src/assets/chatbot.png"
          />
        </button>
      ) : (
        <div className="bg-white flex flex-col h-full border border-gray-300">
          {/* Header */}
          <div
            className="bg-indigo-600 text-white p-3 flex justify-between items-center cursor-move"
            style={{ fontSize: "15px", fontWeight: "600" }}
          >
            <span>Sewa Setu Assistant</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (voiceEnabled) stopSpeaking();
                  setVoiceEnabled((v) => !v);
                }}
                title={voiceEnabled ? "Mute Voice" : "Unmute Voice"}
              >
                {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={() => closeChat()}
                title="Minimize"
                className="ml-1"
              >
                ✖️
              </button>
            </div>
          </div>

          {/* Chat area */}
          <div
            className="flex-1 overflow-y-auto p-3 space-y-2"
            style={{ fontSize: "15px", lineHeight: "1.5", background: "#f9fafb" }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-indigo-100 text-right"
                    : "bg-gray-100 text-left"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-2 border-t flex items-center gap-1 bg-white">
            <button
              className={`rounded-full p-2 ${
                listening ? "bg-red-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setListening((l) => !l)}
              title={listening ? "Stop Listening" : "Voice Input"}
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <input
              type="text"
              className="flex-1 border rounded-lg px-2 py-1 text-sm focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              className="bg-indigo-600 text-white px-3 py-1 rounded-lg"
              onClick={handleSend}
              title="Send"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
