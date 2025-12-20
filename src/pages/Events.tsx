import { useState, useEffect, useRef } from "react";
import { Search, Calendar, MapPin, Clock, ExternalLink, ChevronDown, Plus, X, Loader2, Upload, Mail, Phone, Edit, Trash2, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SaveToggle } from "@/components/ui/save-toggle";
import { createNotificationForUser } from "@/lib/notifications";
import { addPoints } from "@/lib/gamification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const eventTypes = ["All Events", "Tech Fest", "Hackathon", "Workshop", "Cultural", "Sports", "Seminar"];

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  image_url: string | null;
  registration_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  user_id: string;
  college: string;
}

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Events");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [college, setCollege] = useState<string | null>(null);
  const [userCollege, setUserCollege] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "my-events">("all");
  const [rsvpStatuses, setRsvpStatuses] = useState<Record<string, "going" | "interested" | null>>({});
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, { going: number; interested: number }>>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    location: "",
    registration_url: "",
    contact_email: "",
    contact_phone: "",
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
      fetchEvents();
    }
  }, [college]);

  useEffect(() => {
    if (events.length > 0 && user) {
      fetchRSVPs();
    }
  }, [events, user]);

  const handleCollegeChange = (newCollege: string) => {
    setCollege(newCollege);
  };

  const fetchEvents = async () => {
    if (!college) return;
    
    setLoading(true);
    const now = new Date().toISOString();
    
    // Delete past events first
    await supabase
      .from("events")
      .delete()
      .lt("event_date", now);

    let query = supabase
      .from("events")
      .select("*")
      .gte("event_date", now);

    // Only filter by college if not "All Colleges"
    if (college !== "All Colleges") {
      query = query.eq("college", college);
    }

    const { data, error } = await query.order("event_date", { ascending: true });

    if (error) {
      toast({ title: "Error fetching events", description: error.message, variant: "destructive" });
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const fetchRSVPs = async () => {
    if (!user || events.length === 0) return;

    const eventIds = events.map(e => e.id);
    
    // Fetch user's RSVP statuses
    const { data: userRsvps } = await supabase
      .from("event_rsvps")
      .select("event_id, status")
      .eq("user_id", user.id)
      .in("event_id", eventIds);

    const statusMap: Record<string, "going" | "interested" | null> = {};
    userRsvps?.forEach(rsvp => {
      statusMap[rsvp.event_id] = rsvp.status as "going" | "interested";
    });
    setRsvpStatuses(statusMap);

    // Fetch RSVP counts for all events
    const { data: allRsvps } = await supabase
      .from("event_rsvps")
      .select("event_id, status")
      .in("event_id", eventIds);

    const countsMap: Record<string, { going: number; interested: number }> = {};
    eventIds.forEach(id => {
      countsMap[id] = { going: 0, interested: 0 };
    });
    allRsvps?.forEach(rsvp => {
      if (rsvp.status === "going") {
        countsMap[rsvp.event_id].going++;
      } else if (rsvp.status === "interested") {
        countsMap[rsvp.event_id].interested++;
      }
    });
    setRsvpCounts(countsMap);
  };

  const handleRSVP = async (eventId: string, status: "going" | "interested") => {
    if (!user) {
      toast({ title: "Please login to RSVP", variant: "destructive" });
      navigate("/auth");
      return;
    }

    const currentStatus = rsvpStatuses[eventId];
    
    // If clicking the same status, remove RSVP
    if (currentStatus === status) {
      const { error } = await supabase
        .from("event_rsvps")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) {
        toast({ title: "Error updating RSVP", description: error.message, variant: "destructive" });
      } else {
        setRsvpStatuses(prev => ({ ...prev, [eventId]: null }));
        setRsvpCounts(prev => ({
          ...prev,
          [eventId]: {
            going: status === "going" ? Math.max(0, prev[eventId]?.going - 1) : prev[eventId]?.going || 0,
            interested: status === "interested" ? Math.max(0, prev[eventId]?.interested - 1) : prev[eventId]?.interested || 0,
          },
        }));
      }
    } else {
      // Insert or update RSVP
      const { error } = await supabase
        .from("event_rsvps")
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status,
        }, {
          onConflict: "event_id,user_id",
        });

      if (error) {
        toast({ title: "Error updating RSVP", description: error.message, variant: "destructive" });
      } else {
        setRsvpStatuses(prev => ({ ...prev, [eventId]: status }));
        const oldStatus = currentStatus;
        setRsvpCounts(prev => {
          const current = prev[eventId] || { going: 0, interested: 0 };
          return {
            ...prev,
            [eventId]: {
              going: status === "going" ? current.going + 1 : (oldStatus === "going" ? Math.max(0, current.going - 1) : current.going),
              interested: status === "interested" ? current.interested + 1 : (oldStatus === "interested" ? Math.max(0, current.interested - 1) : current.interested),
            },
          };
        });

        // Create notification for event creator
        const event = events.find(e => e.id === eventId);
        if (event && event.user_id !== user.id) {
          void createNotificationForUser(
            event.user_id,
            "event_rsvp",
            "New RSVP",
            `${user.email?.split("@")[0]} ${status === "going" ? "is going" : "is interested"} to "${event.title}"`,
            "/events"
          );
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login to add events", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (profileLoading) {
      toast({ title: "Please wait", description: "Loading your profile...", variant: "default" });
      return;
    }

    if (!formData.title || !formData.event_date) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    setUploading(true);
    let imageUrl = editingEvent?.image_url || null;

    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("events")
        .upload(fileName, selectedFile);

      if (uploadError) {
        toast({ title: "Error uploading image", description: uploadError.message, variant: "destructive" });
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("events").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const eventDateTime = formData.event_time 
      ? `${formData.event_date}T${formData.event_time}:00`
      : `${formData.event_date}T00:00:00`;

    const eventData = {
      title: formData.title,
      description: formData.description,
      event_date: eventDateTime,
      location: formData.location,
      image_url: imageUrl,
      registration_url: formData.registration_url || null,
      contact_email: formData.contact_email || null,
      contact_phone: formData.contact_phone || null,
    };

    if (editingEvent) {
      const { error } = await supabase.from("events").update(eventData).eq("id", editingEvent.id);
      if (error) {
        toast({ title: "Error updating event", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Event updated successfully!" });
      }
    } else {
      if (!userCollege || userCollege.trim() === "") {
        toast({ 
          title: "College not set", 
          description: "Please go to Dashboard and select your college from the dropdown",
          variant: "destructive" 
        });
        setUploading(false);
        return;
      }

      const { data: inserted, error } = await supabase.from("events").insert({
        ...eventData,
        user_id: user.id,
        college: userCollege,
      }).select("id").single();
      
      if (error) {
        toast({ title: "Error saving event", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Event created successfully!" });
        if (inserted?.id) {
          void createNotificationForUser(
            user.id,
            "event_new",
            "Event created",
            formData.title,
            "/events"
          );
          void addPoints(user.id, 15, "event_create");
        }
      }
    }

    setIsDialogOpen(false);
    resetForm();
    fetchEvents();
    setUploading(false);
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", event_date: "", event_time: "", location: "", registration_url: "", contact_email: "", contact_phone: "" });
    setSelectedFile(null);
    setEditingEvent(null);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    const date = new Date(event.event_date);
    setFormData({
      title: event.title,
      description: event.description || "",
      event_date: date.toISOString().split("T")[0],
      event_time: date.toTimeString().slice(0, 5),
      location: event.location || "",
      registration_url: event.registration_url || "",
      contact_email: event.contact_email || "",
      contact_phone: event.contact_phone || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) {
      toast({ title: "Error deleting event", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event deleted successfully!" });
      fetchEvents();
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    // Filter by tab
    if (activeTab === "my-events" && user) {
      const rsvpStatus = rsvpStatuses[event.id];
      return matchesSearch && (rsvpStatus === "going" || rsvpStatus === "interested" || event.user_id === user.id);
    }
    
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-background noise">
      <DashboardNavbar college={college} onCollegeChange={handleCollegeChange} />
      
      <main className="pt-20 sm:pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-stranger text-4xl md:text-5xl text-foreground mb-4">
              Events & <span className="text-primary text-glow-subtle">Happenings</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Never miss a hackathon, fest, or workshop again. All campus events in one place.
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "my-events")} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 glass-dark">
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="my-events">My Events</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-card border-border/50 focus:border-primary"
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-border/50">
                      {selectedType}
                      <ChevronDown className="ml-2 w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-dark border-border/50">
                    {eventTypes.map((type) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className="hover:bg-primary/10 cursor-pointer"
                      >
                        {type}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </DialogTrigger>
              <DialogContent className="glass-dark border-border/50 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-stranger text-foreground">
                    {editingEvent ? "Edit Event" : "Create Event"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., TechFest 2024"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event_date">Date *</Label>
                      <Input
                        id="event_date"
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event_time">Time</Label>
                      <Input
                        id="event_time"
                        type="time"
                        value={formData.event_time}
                        onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Main Auditorium"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="registration_url">Registration Link (Google Form, Website, etc.)</Label>
                    <Input
                      id="registration_url"
                      value={formData.registration_url}
                      onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                      placeholder="https://forms.google.com/..."
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_email">Contact Email</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        placeholder="contact@event.com"
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_phone">Contact Phone</Label>
                      <Input
                        id="contact_phone"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Event details..."
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div>
                    <Label>Event Poster/Image</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-foreground">{selectedFile.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : editingEvent?.image_url ? (
                        <p className="text-sm text-muted-foreground">Current image attached. Click to replace.</p>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload event poster</p>
                        </>
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary" disabled={uploading}>
                    {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {editingEvent ? "Updating..." : "Creating..."}</> : editingEvent ? "Update Event" : "Create Event"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

              {/* Events Grid */}
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredEvents.map((event) => (
                <Card 
                  key={event.id}
                  className="glass-dark border-border/30 hover-glow transition-all duration-300 group overflow-hidden"
                >
                  {event.image_url && (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                       <div className="flex items-center gap-2">
                         <Badge className="bg-green-500/20 text-green-400">
                           Upcoming
                         </Badge>
                         <SaveToggle itemType="event" itemId={event.id} />
                       </div>
                      {user?.id === event.user_id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glass-dark border-border/50">
                            <DropdownMenuItem onClick={() => handleEdit(event)}>
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(event.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <CardTitle className="text-foreground font-serif text-lg mt-3">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary/70" />
                        <span>{formatDate(event.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary/70" />
                        <span>{formatTime(event.event_date)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary/70" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    {/* RSVP Counts */}
                    {(rsvpCounts[event.id]?.going > 0 || rsvpCounts[event.id]?.interested > 0) && (
                      <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                        {rsvpCounts[event.id]?.going > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {rsvpCounts[event.id].going} going
                          </span>
                        )}
                        {rsvpCounts[event.id]?.interested > 0 && (
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {rsvpCounts[event.id].interested} interested
                          </span>
                        )}
                      </div>
                    )}
                    {/* RSVP Buttons */}
                    <div className="flex gap-2 mb-2">
                      <Button
                        variant={rsvpStatuses[event.id] === "going" ? "default" : "outline"}
                        size="sm"
                        className={`flex-1 ${rsvpStatuses[event.id] === "going" ? "bg-green-600 hover:bg-green-700" : ""}`}
                        onClick={() => handleRSVP(event.id, "going")}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Going
                      </Button>
                      <Button
                        variant={rsvpStatuses[event.id] === "interested" ? "default" : "outline"}
                        size="sm"
                        className={`flex-1 ${rsvpStatuses[event.id] === "interested" ? "bg-primary" : ""}`}
                        onClick={() => handleRSVP(event.id, "interested")}
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        Interested
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full border-border/50 hover:bg-primary/10 hover:border-primary/50"
                      onClick={() => {
                        setSelectedEvent(event);
                        setDetailsDialogOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
                ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {!loading && filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl text-foreground mb-2">No upcoming events</h3>
              <p className="text-muted-foreground">Be the first to create an event!</p>
            </div>
          )}

          {/* Event Details Dialog */}
          <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
            <DialogContent className="glass-dark border-border/50 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-stranger text-foreground text-2xl">{selectedEvent?.title}</DialogTitle>
              </DialogHeader>
              {selectedEvent && (
                <div className="space-y-4">
                  {selectedEvent.image_url && (
                    <img 
                      src={selectedEvent.image_url} 
                      alt={selectedEvent.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span>{formatDate(selectedEvent.event_date)} at {formatTime(selectedEvent.event_date)}</span>
                    </div>
                    {selectedEvent.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                    {selectedEvent.contact_email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-5 h-5 text-primary" />
                        <a href={`mailto:${selectedEvent.contact_email}`} className="hover:text-primary">{selectedEvent.contact_email}</a>
                      </div>
                    )}
                    {selectedEvent.contact_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-5 h-5 text-primary" />
                        <a href={`tel:${selectedEvent.contact_phone}`} className="hover:text-primary">{selectedEvent.contact_phone}</a>
                      </div>
                    )}
                  </div>
                  {selectedEvent.description && (
                    <div className="border-t border-border/30 pt-4">
                      <h4 className="font-semibold text-foreground mb-2">About this event</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">{selectedEvent.description}</p>
                    </div>
                  )}
                  {selectedEvent.registration_url && (
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => window.open(selectedEvent.registration_url!, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Register Now
                    </Button>
                  )}
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

export default Events;