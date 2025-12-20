import { useState, useEffect } from "react";
import { MessageCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface ChatSession {
    id: string;
    buyer_id: string;
    seller_id: string;
    listing_id: string;
    created_at: string;
    listing?: {
        title: string;
        image_url: string | null;
    };
    other_user?: {
        full_name: string | null;
        email: string;
    };
    last_message?: {
        content: string;
        created_at: string;
        sender_id: string;
    };
}

const Messages = () => {
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/auth");
            return;
        }
        fetchChats();
    }, [user]);

    const fetchChats = async () => {
        if (!user) return;

        // Fetch chats where user is buyer OR seller
        const { data: chatsData, error } = await supabase
            .from("chats")
            .select(`
            *,
            listing:marketplace_listings(title, image_url)
          `)
            .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching chats:", error);
            setLoading(false);
            return;
        }

        // Enhance chats with other user's info and last message
        const enhancedChats = await Promise.all(
            (chatsData || []).map(async (chat) => {
                const otherUserId = chat.buyer_id === user.id ? chat.seller_id : chat.buyer_id;

                // Fetch other user profile
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("user_id", otherUserId)
                    .single();

                // Fetch last message
                const { data: messages } = await supabase
                    .from("chat_messages")
                    .select("content, created_at, sender_id")
                    .eq("chat_id", chat.id)
                    .order("created_at", { ascending: false })
                    .limit(1);

                return {
                    ...chat,
                    other_user: {
                        full_name: profile?.full_name || "User",
                        email: "", // Not available
                    },
                    last_message: messages?.[0] || null,
                };
            })
        );

        // Filter out chats with no messages
        const activeChats = enhancedChats.filter(chat => chat.last_message !== null);

        setChats(activeChats);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-background noise-overlay">
            <DashboardNavbar college={null} onCollegeChange={() => { }} />

            <main className="pt-20 sm:pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex items-center gap-3 mb-8">
                        <MessageCircle className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-stranger text-foreground">My Messages</h1>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="text-center py-16 glass-dark rounded-xl border border-border/30">
                            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-foreground mb-2">No messages yet</h2>
                            <p className="text-muted-foreground mb-6">
                                Start a conversation by contacting a seller in the Marketplace.
                            </p>
                            <Button onClick={() => navigate("/marketplace")} className="bg-primary hover:bg-primary/90">
                                Go to Marketplace
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {chats.map((chat) => {
                                const isUnread = chat.last_message?.sender_id !== user?.id;

                                return (
                                    <Card
                                        key={chat.id}
                                        className={`glass-dark border-border/30 hover:border-primary/50 transition-colors cursor-pointer ${isUnread ? "border-l-4 border-l-primary bg-primary/5" : ""}`}
                                        onClick={() => navigate(`/chat/${chat.id}`)}
                                    >
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                                                {chat.listing?.image_url ? (
                                                    <img
                                                        src={chat.listing.image_url}
                                                        alt={chat.listing.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <MessageCircle className="w-6 h-6 text-primary" />
                                                )}
                                                {isUnread && (
                                                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className={`font-semibold text-foreground truncate ${isUnread ? "text-primary" : ""}`}>
                                                        {chat.other_user?.full_name}
                                                    </h3>
                                                    {chat.last_message && (
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                            {new Date(chat.last_message.created_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-sm text-primary/80 font-medium truncate mb-1">
                                                    {chat.listing?.title}
                                                </p>

                                                <p className={`text-sm truncate ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                                    {isUnread ? "New message: " : "You: "}
                                                    {chat.last_message?.content || "Sent an attachment"}
                                                </p>
                                            </div>

                                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Messages;
