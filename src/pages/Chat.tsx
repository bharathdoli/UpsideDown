import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Chat {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  listing?: {
    title: string;
    image_url: string | null;
  };
  other_user?: {
    full_name: string | null;
    email: string;
  };
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (chatId) {
      fetchChat();
    }
  }, [chatId, user]);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      const channel = supabase
        .channel(`chat:${chatId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `chat_id=eq.${chatId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChat = async () => {
    if (!chatId || !user) return;

    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .single();

    if (chatError || !chatData) {
      toast({ title: "Error loading chat", description: chatError?.message || "Chat not found", variant: "destructive" });
      navigate("/marketplace");
      return;
    }

    // Fetch listing
    const { data: listingData } = await supabase
      .from("marketplace_listings")
      .select("id, title, image_url")
      .eq("id", chatData.listing_id)
      .single();

    // Fetch other user's profile
    const otherUserId = chatData.buyer_id === user.id ? chatData.seller_id : chatData.buyer_id;
    const { data: otherUserProfile } = await supabase
      .from("profiles")
      .select("full_name, user_id")
      .eq("user_id", otherUserId)
      .single();

    setChat({
      ...chatData,
      listing: listingData || undefined,
      other_user: {
        full_name: otherUserProfile?.full_name || null,
        email: "", // Email not accessible without admin API
      },
    });
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!chatId) return;

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error loading messages", description: error.message, variant: "destructive" });
    } else {
      setMessages(data || []);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !user || sending) return;

    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      chat_id: chatId,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast({ title: "Error sending message", description: error.message, variant: "destructive" });
    } else {
      setNewMessage("");
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background noise">
        <DashboardNavbar />
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!chat) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background noise">
      <DashboardNavbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="glass-dark border-border/30">
            <CardHeader className="border-b border-border/30">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/marketplace")}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {chat.other_user?.full_name || chat.other_user?.email?.split("@")[0] || "User"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {chat.listing?.title}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {new Date(msg.created_at).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="border-t border-border/30 p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-background/50 border-border/50"
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()}>
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Chat;

