import React, { useState } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="flex items-center gap-2 p-3 border-t bg-white">
      <Textarea
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="resize-none h-10 flex-1 rounded-2xl"
      />
      <Button size="icon" onClick={handleSend} className="rounded-full">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MessageInput;
