import { useState, useEffect } from "react";
import { Search, Users, BookOpen, Clock, Plus, MessageCircle, Loader2, Edit, Trash2, HelpCircle, GraduationCap, Linkedin, Phone } from "lucide-react";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SaveToggle } from "@/components/ui/save-toggle";

const subjects = [
  "All Subjects",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Biology",
];

interface StudyRequest {
  id: string;
  subject: string;
  description: string | null;
  is_active: boolean | null;
  request_type: string | null;
  created_at: string;
  user_id: string;
  college: string;
  phone_number: string | null;
  linkedin_url: string | null;
}

const StudyBuddy = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [activeTab, setActiveTab] = useState("need_help");
  const [requests, setRequests] = useState<StudyRequest[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [groupMembers, setGroupMembers] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupFormData, setGroupFormData] = useState({
    subject: "",
    description: "",
    max_members: 5,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRequest, setEditingRequest] = useState<StudyRequest | null>(null);
  const [college, setCollege] = useState<string | null>(null);
  const [userCollege, setUserCollege] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StudyRequest | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    request_type: "need_help",
    phone_number: "",
    linkedin_url: "",
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      // Set default view to "All Colleges"
      setCollege("All Colleges");
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    setProfileLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("college")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    }

    if (data?.college && data.college.trim() !== "") {
      setUserCollege(data.college);
    }
    setProfileLoading(false);
  };

  useEffect(() => {
    if (college) {
      fetchRequests();
      if (activeTab === "groups") {
        fetchGroups();
      }
    }
  }, [college, activeTab]);

  const handleCollegeChange = (newCollege: string) => {
    setCollege(newCollege);
  };

  const fetchRequests = async () => {
    if (!college) return;

    setLoading(true);
    let query = supabase
      .from("study_buddy_requests")
      .select("*")
      .eq("is_active", true);

    // Only filter by college if not "All Colleges"
    if (college !== "All Colleges") {
      query = query.eq("college", college);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching requests", description: error.message, variant: "destructive" });
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const fetchGroups = async () => {
    setLoading(true);
    // Display all groups from backend without any filtering for everyone
    const { data, error } = await supabase
      .from("study_groups")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching groups", description: error.message, variant: "destructive" });
    } else {
      setGroups(data || []);
      // Fetch members for each group
      if (data && data.length > 0) {
        const groupIds = data.map(g => g.id);
        const { data: members } = await supabase
          .from("study_group_members")
          .select("*")
          .in("group_id", groupIds);

        const membersMap: Record<string, any[]> = {};
        groupIds.forEach(id => {
          membersMap[id] = members?.filter(m => m.group_id === id) || [];
        });
        setGroupMembers(membersMap);
      }
    }
    setLoading(false);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userCollege) return;

    const { data: insertedGroup, error: groupError } = await supabase.from("study_groups").insert({
      subject: groupFormData.subject,
      description: groupFormData.description,
      college: userCollege,
      created_by: user.id,
      max_members: groupFormData.max_members,
    }).select("id").single();

    if (groupError || !insertedGroup) {
      toast({ title: "Error creating group", description: groupError?.message || "Failed to create group", variant: "destructive" });
      return;
    }

    // Automatically add creator as member
    const { error: memberError } = await supabase.from("study_group_members").insert({
      group_id: insertedGroup.id,
      user_id: user.id,
      role: "creator",
    });

    if (memberError) {
      toast({ title: "Group created but failed to add you as member", description: memberError.message, variant: "destructive" });
    } else {
      toast({ title: "Group created!" });
      setGroupDialogOpen(false);
      setGroupFormData({ subject: "", description: "", max_members: 5 });
      fetchGroups();
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      toast({ title: "Please login", variant: "destructive" });
      navigate("/auth");
      return;
    }

    // Allow joining groups from any college (Cross-college collaboration)

    const group = groups.find(g => g.id === groupId);
    const currentMembers = groupMembers[groupId] || [];

    if (currentMembers.length >= (group?.max_members || 5)) {
      toast({ title: "Group is full", variant: "destructive" });
      return;
    }

    if (currentMembers.some(m => m.user_id === user.id)) {
      toast({ title: "You're already in this group", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("study_group_members").insert({
      group_id: groupId,
      user_id: user.id,
      role: group?.created_by === user.id ? "creator" : "member",
    });

    if (error) {
      toast({ title: "Error joining group", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Joined group!" });
      fetchGroups();
      // Auto-add creator as member if not already added
      if (group?.created_by === user.id) {
        // Already handled by role check above
      }
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("study_group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error leaving group", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Left group" });
      fetchGroups();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login to create a request", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (profileLoading) {
      toast({ title: "Please wait", description: "Loading your profile...", variant: "default" });
      return;
    }

    if (!formData.subject) {
      toast({ title: "Please select a subject", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const requestData = {
      subject: formData.subject,
      description: formData.description || null,
      request_type: formData.request_type,
      phone_number: formData.phone_number || null,
      linkedin_url: formData.linkedin_url || null,
    };

    if (editingRequest) {
      const { error } = await supabase.from("study_buddy_requests").update(requestData).eq("id", editingRequest.id);
      if (error) {
        toast({ title: "Error updating request", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Request updated successfully!" });
      }
    } else {
      if (!userCollege || userCollege.trim() === "") {
        toast({
          title: "College not set",
          description: "Please go to Dashboard and select your college from the dropdown",
          variant: "destructive"
        });
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("study_buddy_requests").insert({
        ...requestData,
        user_id: user.id,
        college: userCollege,
      });
      if (error) {
        toast({ title: "Error creating request", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Study buddy request created!" });
      }
    }

    setIsDialogOpen(false);
    resetForm();
    fetchRequests();
    setSubmitting(false);
  };

  const resetForm = () => {
    setFormData({ subject: "", description: "", request_type: "need_help", phone_number: "", linkedin_url: "" });
    setEditingRequest(null);
  };

  const handleEdit = (request: StudyRequest) => {
    setEditingRequest(request);
    setFormData({
      subject: request.subject,
      description: request.description || "",
      request_type: request.request_type || "need_help",
      phone_number: request.phone_number || "",
      linkedin_url: request.linkedin_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    const { error } = await supabase.from("study_buddy_requests").delete().eq("id", requestId);
    if (error) {
      toast({ title: "Error deleting request", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request deleted successfully!" });
      fetchRequests();
    }
  };

  const handleDeactivate = async (requestId: string) => {
    const { error } = await supabase.from("study_buddy_requests").update({ is_active: false }).eq("id", requestId);
    if (error) {
      toast({ title: "Error deactivating request", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request deactivated!" });
      fetchRequests();
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesSubject = selectedSubject === "All Subjects" || req.subject === selectedSubject;
    const matchesType = req.request_type === activeTab || !req.request_type;
    return matchesSearch && matchesSubject && matchesType;
  });

  const needHelpCount = requests.filter(r => r.request_type === "need_help" || !r.request_type).length;
  const canHelpCount = requests.filter(r => r.request_type === "can_help").length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background noise-overlay">
      <DashboardNavbar college={college} onCollegeChange={handleCollegeChange} />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-stranger text-foreground mb-4 flicker">
              Study <span className="text-primary">Buddy</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find study partners or offer your expertise. Learning is better together!
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="glass-dark rounded-xl p-4 text-center border border-border/30">
              <HelpCircle className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-warning">{needHelpCount}</p>
              <p className="text-sm text-muted-foreground">Need Help</p>
            </div>
            <div className="glass-dark rounded-xl p-4 text-center border border-border/30">
              <GraduationCap className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-400">{canHelpCount}</p>
              <p className="text-sm text-muted-foreground">Can Help</p>
            </div>
            <div className="glass-dark rounded-xl p-4 text-center border border-border/30 col-span-2 md:col-span-1">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{requests.length}</p>
              <p className="text-sm text-muted-foreground">Active Requests</p>
            </div>
          </div>

          {/* Create Button */}
          <div className="flex justify-center gap-4 mb-8">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button
                  className="bg-warning hover:bg-warning/90 text-warning-foreground box-glow gap-2"
                  size="lg"
                  onClick={() => setFormData(prev => ({ ...prev, request_type: "need_help" }))}
                >
                  <HelpCircle className="w-5 h-5" />
                  I Need Help
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-dark border-border/50">
                <DialogHeader>
                  <DialogTitle className="font-stranger text-foreground">
                    {editingRequest ? "Edit Request" : formData.request_type === "can_help" ? "Offer Your Help" : "Find a Study Buddy"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Request Type</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant={formData.request_type === "need_help" ? "default" : "outline"}
                        className={formData.request_type === "need_help" ? "bg-warning text-warning-foreground" : "border-border/50"}
                        onClick={() => setFormData(prev => ({ ...prev, request_type: "need_help" }))}
                      >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        I Need Help
                      </Button>
                      <Button
                        type="button"
                        variant={formData.request_type === "can_help" ? "default" : "outline"}
                        className={formData.request_type === "can_help" ? "bg-green-600 text-white" : "border-border/50"}
                        onClick={() => setFormData(prev => ({ ...prev, request_type: "can_help" }))}
                      >
                        <GraduationCap className="w-4 h-4 mr-2" />
                        I Can Help
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v })}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent className="glass-dark border-border/50">
                        {subjects.filter(s => s !== "All Subjects").map(sub => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">
                      {formData.request_type === "can_help"
                        ? "What topics can you help with?"
                        : "What do you need help with?"}
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={formData.request_type === "can_help"
                        ? "Describe what topics you're proficient in and can teach..."
                        : "Describe what topics you want to study together..."}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        placeholder="+91 9876543210"
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                      <Input
                        id="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className={`w-full ${formData.request_type === "can_help" ? "bg-green-600 hover:bg-green-700" : "bg-warning hover:bg-warning/90"}`}
                    disabled={submitting}
                  >
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {editingRequest ? "Updating..." : "Creating..."}</> : editingRequest ? "Update Request" : "Create Request"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white box-glow gap-2"
              size="lg"
              onClick={() => {
                setFormData(prev => ({ ...prev, request_type: "can_help" }));
                setIsDialogOpen(true);
              }}
            >
              <GraduationCap className="w-5 h-5" />
              I Can Help
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 glass-dark">
              <TabsTrigger value="need_help" className="data-[state=active]:bg-warning data-[state=active]:text-warning-foreground">
                <HelpCircle className="w-4 h-4 mr-2" />
                Need Help ({needHelpCount})
              </TabsTrigger>
              <TabsTrigger value="can_help" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <GraduationCap className="w-4 h-4 mr-2" />
                Can Help ({canHelpCount})
              </TabsTrigger>
              <TabsTrigger value="groups" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="w-4 h-4 mr-2" />
                Groups ({groups.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {/* Search & Filters */}
              <div className="glass-dark rounded-xl p-4 mb-8 border border-border/30">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search study requests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full md:w-48 bg-background/50 border-border/50">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent className="glass-dark border-border/50">
                      {subjects.map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Study Requests Grid */}
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : activeTab === "groups" ? (
                <>
                  <div className="flex justify-end mb-4">
                    <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Group
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-dark border-border/50">
                        <DialogHeader>
                          <DialogTitle>Create Study Group</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                          <div>
                            <Label>Subject *</Label>
                            <Select value={groupFormData.subject} onValueChange={(v) => setGroupFormData({ ...groupFormData, subject: v })}>
                              <SelectTrigger className="bg-background/50 border-border/50">
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects.filter(s => s !== "All Subjects").map(sub => (
                                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={groupFormData.description}
                              onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                              placeholder="Describe your study group..."
                              className="bg-background/50 border-border/50"
                            />
                          </div>
                          <div>
                            <Label>Max Members</Label>
                            <Input
                              type="number"
                              min="2"
                              max="10"
                              value={groupFormData.max_members}
                              onChange={(e) => setGroupFormData({ ...groupFormData, max_members: parseInt(e.target.value) || 5 })}
                              className="bg-background/50 border-border/50"
                            />
                          </div>
                          <Button type="submit" className="w-full">Create Group</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map(group => {
                      const members = groupMembers[group.id] || [];
                      const isMember = members.some(m => m.user_id === user?.id);
                      const isCreator = group.created_by === user?.id;
                      return (
                        <div key={group.id} className="glass-dark rounded-xl p-6 border border-border/30 hover-glow">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">{group.subject}</h3>
                              {group.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{group.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <Users className="w-4 h-4" />
                            <span>{members.length} / {group.max_members} members</span>
                          </div>
                          <div className="flex gap-2">
                            {isMember ? (
                              <>
                                <Button
                                  className="flex-1 bg-primary hover:bg-primary/90"
                                  onClick={() => navigate(`/group-chat/${group.id}`)}
                                >
                                  Open Chat
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => handleLeaveGroup(group.id)}
                                  disabled={isCreator}
                                >
                                  {isCreator ? "Creator" : "Leave"}
                                </Button>
                              </>
                            ) : (
                              <Button
                                className="w-full bg-primary hover:bg-primary/90"
                                onClick={() => handleJoinGroup(group.id)}
                                disabled={members.length >= group.max_members}
                              >
                                {members.length >= group.max_members ? "Group Full" : "Join Group"}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {groups.length === 0 && (
                    <div className="text-center py-16">
                      <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-xl text-foreground mb-2">No study groups yet</h3>
                      <p className="text-muted-foreground">Create the first study group!</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRequests.map(req => (
                    <div
                      key={req.id}
                      className={`glass-dark rounded-xl p-6 border transition-all group ${req.request_type === "can_help"
                        ? "border-green-500/30 hover:border-green-500/50"
                        : "border-warning/30 hover:border-warning/50"
                        }`}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl border ${req.request_type === "can_help"
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-warning/10 border-warning/30"
                          }`}>
                          {req.request_type === "can_help" ? "🎓" : "📚"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                              {req.subject}
                            </h3>
                            <SaveToggle itemType="study_buddy" itemId={req.id} />
                            {user?.id === req.user_id && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="glass-dark border-border/50">
                                  <DropdownMenuItem onClick={() => handleEdit(req)}>
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeactivate(req.id)}>
                                    <Clock className="w-4 h-4 mr-2" /> Deactivate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(req.id)} className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {req.request_type === "can_help" ? "Ready to teach" : "Looking for study partner"}
                          </p>
                        </div>
                      </div>

                      {req.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {req.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline" className={
                          req.request_type === "can_help"
                            ? "border-green-500/50 text-green-400"
                            : "border-warning/50 text-warning"
                        }>
                          {req.subject}
                        </Badge>
                        <Badge className={
                          req.request_type === "can_help"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-warning/20 text-warning border border-warning/30"
                        }>
                          {req.request_type === "can_help" ? "Can Help" : "Need Help"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(req.created_at)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full border-border/50 hover:bg-primary/10 hover:border-primary/50"
                          onClick={() => {
                            setSelectedRequest(req);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                        <div className="flex gap-2">
                          {req.linkedin_url && (
                            <Button
                              className={`flex-1 gap-1 ${req.request_type === "can_help"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-warning hover:bg-warning/90 text-warning-foreground"
                                }`}
                              onClick={() => window.open(req.linkedin_url!, "_blank")}
                            >
                              <Linkedin className="w-4 h-4" />
                              Connect
                            </Button>
                          )}
                          {req.phone_number && (
                            <Button
                              variant="outline"
                              className="flex-1 gap-1 border-border/50"
                              onClick={() => window.open(`tel:${req.phone_number}`)}
                            >
                              <Phone className="w-4 h-4" />
                              Contact
                            </Button>
                          )}
                          {!req.linkedin_url && !req.phone_number && (
                            <Button
                              className={`w-full gap-1 ${req.request_type === "can_help"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-warning hover:bg-warning/90 text-warning-foreground"
                                }`}
                              disabled
                            >
                              <MessageCircle className="w-4 h-4" />
                              No Contact Info
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {!loading && activeTab !== "groups" && filteredRequests.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl text-foreground mb-2">No {activeTab === "can_help" ? "tutors" : "requests"} found</h3>
              <p className="text-muted-foreground">Be the first to {activeTab === "can_help" ? "offer help" : "create a study buddy request"}!</p>
            </div>
          )}

          {/* Details Dialog */}
          <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
            <DialogContent className="glass-dark border-border/50 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-stranger text-foreground text-2xl">
                  {selectedRequest?.subject}
                </DialogTitle>
              </DialogHeader>
              {selectedRequest && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl border ${selectedRequest.request_type === "can_help"
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-warning/10 border-warning/30"
                      }`}>
                      {selectedRequest.request_type === "can_help" ? "🎓" : "📚"}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{selectedRequest.subject}</h3>
                      <Badge className={
                        selectedRequest.request_type === "can_help"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-warning/20 text-warning border border-warning/30"
                      }>
                        {selectedRequest.request_type === "can_help" ? "Can Help" : "Need Help"}
                      </Badge>
                    </div>
                  </div>

                  {selectedRequest.description && (
                    <div className="border-t border-border/30 pt-4">
                      <h4 className="font-semibold text-foreground mb-2">
                        {selectedRequest.request_type === "can_help" ? "Topics I can help with:" : "What I need help with:"}
                      </h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">{selectedRequest.description}</p>
                    </div>
                  )}

                  <div className="border-t border-border/30 pt-4">
                    <h4 className="font-semibold text-foreground mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      {selectedRequest.linkedin_url && (
                        <a
                          href={selectedRequest.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Linkedin className="w-5 h-5 text-primary" />
                          LinkedIn Profile
                        </a>
                      )}
                      {selectedRequest.phone_number && (
                        <a
                          href={`tel:${selectedRequest.phone_number}`}
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Phone className="w-5 h-5 text-primary" />
                          {selectedRequest.phone_number}
                        </a>
                      )}
                      {!selectedRequest.linkedin_url && !selectedRequest.phone_number && (
                        <p className="text-sm text-muted-foreground">No contact information provided</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border/30 pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Posted {formatDate(selectedRequest.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {selectedRequest.linkedin_url && (
                      <Button
                        className={`flex-1 ${selectedRequest.request_type === "can_help"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-warning hover:bg-warning/90 text-warning-foreground"
                          }`}
                        onClick={() => window.open(selectedRequest.linkedin_url!, "_blank")}
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        Connect on LinkedIn
                      </Button>
                    )}
                    {selectedRequest.phone_number && (
                      <Button
                        variant="outline"
                        className="flex-1 border-border/50"
                        onClick={() => window.open(`tel:${selectedRequest.phone_number}`)}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudyBuddy;