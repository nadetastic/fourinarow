"use client";

import { FourInARowComponent } from "@/components/FourInARow";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X } from "lucide-react";
import { events } from "aws-amplify/data";
import { AuthUser, getCurrentUser } from "aws-amplify/auth";

interface ChatMessage {
  message: string;
  sender: string;
}

export default function GamePage() {
  const params = useParams();
  const gameCode = params?.code as string;
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<AuthUser>();

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    async function handleConnect() {
      if (gameCode && !subscription) {
        const channel = await events.connect("/chat/channel");
        subscription = channel.subscribe({
          next: (data) => {
            setMessages((prevMessages) => {
              if (
                !prevMessages.some(
                  (msg) =>
                    msg.message === data.event.message &&
                    msg.sender === data.event.sender
                )
              ) {
                return [
                  ...prevMessages,
                  { message: data.event.message, sender: data.event.sender },
                ];
              }
              return prevMessages;
            });
          },
          error: (err) => console.error("Chat connection error:", err),
        });
      }
    }

    handleConnect();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [gameCode]);

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newMessage.trim() &&
      !messages.some((msg) => msg.message === newMessage)
    ) {
      await events.post("/chat/channel", {
        message: newMessage,
        sender: user?.signInDetails?.loginId as string,
      });
      setNewMessage("");
    }
  };

  return (
    <>
      <FourInARowComponent />

      <div className="fixed bottom-4 right-4">
        <Button
          onClick={toggleChat}
          className="rounded-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Chat
        </Button>
      </div>

      {isChatOpen && (
        <Card className="fixed bottom-16 right-4 w-80 h-96 z-50">
          <CardContent className="p-3 flex flex-col h-full">
            <div className="flex justify-end mb-2">
              <Button variant="ghost" size="sm" onClick={toggleChat}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-grow overflow-auto space-y-2 mb-2">
              {messages.map((message, index) => (
                <div key={index}>
                  <div
                    className={`p-2 rounded-lg text-sm ${
                      message.sender === user?.signInDetails?.loginId
                        ? "bg-blue-500 text-white text-right"
                        : "bg-gray-200 text-gray-800 ml-auto"
                    }`}
                  >
                    {message.message}
                  </div>
                  <div
                    className={`text-xs text-slate-500 ${
                      message.sender === user?.signInDetails?.loginId
                        ? "text-right"
                        : ""
                    }`}
                  >
                    {message.sender === user?.signInDetails?.loginId
                      ? "You"
                      : message.sender.split("@")[0]}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="flex space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow text-sm"
              />
              <Button type="submit" size="sm">
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
