import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Loader2, Paperclip, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GroupChatMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  sender?: {
    full_name: string | null;
  };
}

interface Group {
  id: string;
  subject: string;
  description: string | null;
  college: string;
  created_by: string;
  max_members: number;
}

const GroupChat = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (groupId) {
      fetchGroup();
      fetchMembers();
    }
  }, [groupId, user]);

  useEffect(() => {
    if (groupId) {
      fetchMessages();
      const channel = supabase
        .channel(`group_chat:${groupId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "group_chat_messages",
            filter: `group_id=eq.${groupId}`,
          },
          async (payload) => {
            const newMsg = payload.new as GroupChatMessage;
            // Fetch sender info
            const { data: senderProfile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", newMsg.sender_id)
              .single();
            setMessages((prev) => [...prev, { ...newMsg, sender: senderProfile || undefined }]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchGroup = async () => {
    if (!groupId) return;

    const { data, error } = await supabase
      .from("study_groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (error) {
      toast({ title: "Error loading group", description: error.message, variant: "destructive" });
      navigate("/study-buddy");
      return;
    }

    setGroup(data);
    setLoading(false);
  };

  const fetchMembers = async () => {
    if (!groupId) return;

    const { data } = await supabase
      .from("study_group_members")
      .select(`
        *,
        profile:profiles!study_group_members_user_id_fkey(full_name, user_id)
      `)
      .eq("group_id", groupId);

    setMembers((data || []) as any);
  };

  const fetchMessages = async () => {
    if (!groupId) return;

    const { data, error } = await supabase
      .from("group_chat_messages")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error loading messages", description: error.message, variant: "destructive" });
      return;
    }

    // Fetch sender info for each message
    const messagesWithSenders = await Promise.all(
      (data || []).map(async (msg) => {
        const { data: senderProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", msg.sender_id)
          .single();
        return { ...msg, sender: senderProfile || undefined };
      })
    );

    setMessages(messagesWithSenders);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Maximum file size is 10MB", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !groupId || !user || sending) return;

    setSending(true);
    setUploading(selectedFile !== null);

    let fileUrl = null;
    let fileName = null;

    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName_upload = `${groupId}/${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("group-files")
        .upload(fileName_upload, selectedFile);

      if (uploadError) {
        toast({ title: "Error uploading file", description: uploadError.message, variant: "destructive" });
        setSending(false);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("group-files").getPublicUrl(fileName_upload);
      fileUrl = urlData.publicUrl;
      fileName = selectedFile.name;
    }

    const { error } = await supabase.from("group_chat_messages").insert({
      group_id: groupId,
      sender_id: user.id,
      content: newMessage.trim() || null,
      file_url: fileUrl,
      file_name: fileName,
    });

    if (error) {
      toast({ title: "Error sending message", description: error.message, variant: "destructive" });
    } else {
      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    setSending(false);
    setUploading(false);
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

  if (!group) {
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
                <Button variant="ghost" size="sm" onClick={() => navigate("/study-buddy")}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <CardTitle className="text-lg">{group.subject}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {members.length} members
                    </Badge>
                    {group.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{group.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id;
                  const senderName = msg.sender?.full_name || `User ${msg.sender_id.slice(0, 8)}`;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] ${!isOwn ? "flex flex-col" : ""}`}>
                        {!isOwn && (
                          <p className="text-xs text-muted-foreground mb-1 px-2">{senderName}</p>
                        )}
                        <div
                          className={`rounded-lg p-3 ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {msg.content && <p className="text-sm">{msg.content}</p>}
                          {msg.file_url && (
                            <div className="mt-2">
                              <a
                                href={msg.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm underline"
                              >
                                <Download className="w-4 h-4" />
                                {msg.file_name || "Download file"}
                              </a>
                            </div>
                          )}
                          <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {new Date(msg.created_at).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              {selectedFile && (
                <div className="px-4 py-2 border-t border-border/30 flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground truncate max-w-xs">{selectedFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="border-t border-border/30 p-4">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-background/50 border-border/50"
                  />
                  <Button type="submit" disabled={sending || uploading || (!newMessage.trim() && !selectedFile)}>
                    {sending || uploading ? (
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

export default GroupChat;

