import { useState, useEffect } from "react";
import { Search, Plus, Filter, Loader2, Youtube, ThumbsUp, Eye, Clock, ExternalLink, Edit, Trash2, Star } from "lucide-react";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

interface Tutorial {
  id: string;
  user_id: string;
  college: string;
  title: string;
  description: string | null;
  youtube_url: string;
  subject: string;
  branch: string | null;
  difficulty: string | null;
  duration_minutes: number | null;
  thumbnail_url: string | null;
  view_count: number;
  like_count: number;
  created_at: string;
}

const YouTubeTutorials = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [college, setCollege] = useState<string | null>(null);
  const [userCollege, setUserCollege] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtube_url: "",
    subject: "",
    branch: "",
    difficulty: "",
    duration_minutes: "",
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
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
      fetchTutorials();
    }
  }, [college]);

  useEffect(() => {
    if (tutorials.length > 0 && user) {
      fetchLikes();
    }
  }, [tutorials, user]);

  const handleCollegeChange = (newCollege: string) => {
    setCollege(newCollege);
  };

  const fetchTutorials = async () => {
    if (!college) return;
    
    setLoading(true);
    let query = supabase
      .from("youtube_tutorials")
      .select("*");

    // Only filter by college if not "All Colleges"
    if (college !== "All Colleges") {
      query = query.eq("college", college);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching tutorials", description: error.message, variant: "destructive" });
    } else {
      setTutorials(data || []);
    }
    setLoading(false);
  };

  const fetchLikes = async () => {
    if (!user || tutorials.length === 0) return;

    const tutorialIds = tutorials.map(t => t.id);
    const { data } = await supabase
      .from("tutorial_likes")
      .select("tutorial_id")
      .eq("user_id", user.id)
      .in("tutorial_id", tutorialIds);

    const likedMap: Record<string, boolean> = {};
    data?.forEach(like => {
      likedMap[like.tutorial_id] = true;
    });
    setUserLiked(likedMap);
  };

  const handleToggleLike = async (tutorialId: string) => {
    if (!user) {
      toast({ title: "Please login to like", variant: "destructive" });
      navigate("/auth");
      return;
    }

    const isLiked = userLiked[tutorialId];
    
    if (isLiked) {
      const { error } = await supabase
        .from("tutorial_likes")
        .delete()
        .eq("tutorial_id", tutorialId)
        .eq("user_id", user.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setUserLiked(prev => ({ ...prev, [tutorialId]: false }));
        setTutorials(prev => prev.map(t => 
          t.id === tutorialId ? { ...t, like_count: Math.max(0, t.like_count - 1) } : t
        ));
      }
    } else {
      const { error } = await supabase.from("tutorial_likes").insert({
        tutorial_id: tutorialId,
        user_id: user.id,
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setUserLiked(prev => ({ ...prev, [tutorialId]: true }));
        setTutorials(prev => prev.map(t => 
          t.id === tutorialId ? { ...t, like_count: t.like_count + 1 } : t
        ));
      }
    }
  };

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getThumbnailUrl = (youtubeUrl: string): string => {
    const videoId = extractVideoId(youtubeUrl);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login to post", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (profileLoading) {
      toast({ title: "Please wait", description: "Loading your profile...", variant: "default" });
      return;
    }

    if (!formData.title || !formData.youtube_url || !formData.subject) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    if (college === "All Colleges") {
      toast({ title: "Please select a specific college", variant: "destructive" });
      return;
    }

    if (!userCollege || userCollege.trim() === "") {
      toast({ 
        title: "College not set", 
        description: "Please go to Dashboard and select your college",
        variant: "destructive" 
      });
      setSubmitting(false);
      return;
    }

    const videoId = extractVideoId(formData.youtube_url);
    if (!videoId) {
      toast({ title: "Invalid YouTube URL", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const thumbnailUrl = getThumbnailUrl(formData.youtube_url);

    if (editingTutorial) {
      const { error } = await supabase.from("youtube_tutorials").update({
        title: formData.title,
        description: formData.description || null,
        youtube_url: formData.youtube_url,
        subject: formData.subject,
        branch: formData.branch || null,
        difficulty: formData.difficulty || null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        thumbnail_url: thumbnailUrl,
      }).eq("id", editingTutorial.id);

      if (error) {
        toast({ title: "Error updating tutorial", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Tutorial updated successfully!" });
      }
    } else {
      const { error } = await supabase.from("youtube_tutorials").insert({
        title: formData.title,
        description: formData.description || null,
        youtube_url: formData.youtube_url,
        subject: formData.subject,
        branch: formData.branch || null,
        difficulty: formData.difficulty || null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        thumbnail_url: thumbnailUrl,
        user_id: user.id,
        college: userCollege,
      });
      if (error) {
        toast({ title: "Error posting tutorial", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Tutorial posted successfully!" });
      }
    }

    setIsDialogOpen(false);
    resetForm();
    fetchTutorials();
    setSubmitting(false);
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", youtube_url: "", subject: "", branch: "", difficulty: "", duration_minutes: "" });
    setEditingTutorial(null);
  };

  const handleEdit = (tutorial: Tutorial) => {
    setEditingTutorial(tutorial);
    setFormData({
      title: tutorial.title,
      description: tutorial.description || "",
      youtube_url: tutorial.youtube_url,
      subject: tutorial.subject,
      branch: tutorial.branch || "",
      difficulty: tutorial.difficulty || "",
      duration_minutes: tutorial.duration_minutes?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (tutorialId: string) => {
    if (!confirm("Are you sure you want to delete this tutorial?")) return;
    
    const { error } = await supabase.from("youtube_tutorials").delete().eq("id", tutorialId);
    if (error) {
      toast({ title: "Error deleting tutorial", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tutorial deleted successfully!" });
      fetchTutorials();
    }
  };

  const handleView = async (tutorial: Tutorial) => {
    // Increment view count
    await supabase
      .from("youtube_tutorials")
      .update({ view_count: tutorial.view_count + 1 })
      .eq("id", tutorial.id);
    
    setTutorials(prev => prev.map(t => 
      t.id === tutorial.id ? { ...t, view_count: t.view_count + 1 } : t
    ));
    
    // Open YouTube in new tab
    window.open(tutorial.youtube_url, "_blank");
  };

  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (tutorial.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesSubject = selectedSubject === "All Subjects" || tutorial.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === "All" || tutorial.difficulty === selectedDifficulty.toLowerCase();
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const sortedTutorials = [...filteredTutorials].sort((a, b) => {
    if (selectedSort === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (selectedSort === "most_liked") {
      return b.like_count - a.like_count;
    } else if (selectedSort === "most_viewed") {
      return b.view_count - a.view_count;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-background noise">
      <DashboardNavbar college={college} onCollegeChange={handleCollegeChange} />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-stranger text-4xl md:text-5xl text-foreground mb-4">
              YouTube <span className="text-primary text-glow-subtle">Tutorials</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover and share the best YouTube tutorials for your subjects. Learn from the community!
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border/50 focus:border-primary"
              />
            </div>
            
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-48 border-border/50">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent className="glass-dark border-border/50">
                {subjects.map((sub) => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-48 border-border/50">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="glass-dark border-border/50">
                {difficulties.map((diff) => (
                  <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className="w-full md:w-48 border-border/50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="glass-dark border-border/50">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="most_liked">Most Liked</SelectItem>
                <SelectItem value="most_viewed">Most Viewed</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tutorial
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-dark border-border/50 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-stranger text-foreground">
                    {editingTutorial ? "Edit Tutorial" : "Add YouTube Tutorial"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Linear Algebra Basics"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="youtube_url">YouTube URL *</Label>
                    <Input
                      id="youtube_url"
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="What topics does this tutorial cover?"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v })}>
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
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="branch">Branch</Label>
                      <Input
                        id="branch"
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        placeholder="e.g., CSE, ECE"
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                      <Input
                        id="duration_minutes"
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                        placeholder="e.g., 45"
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary" disabled={submitting}>
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {editingTutorial ? "Updating..." : "Posting..."}</> : editingTutorial ? "Update Tutorial" : "Post Tutorial"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tutorials Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {sortedTutorials.map((tutorial) => {
                const videoId = extractVideoId(tutorial.youtube_url);
                const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : "";
                
                return (
                  <Card 
                    key={tutorial.id}
                    className="glass-dark border-border/30 hover-glow transition-all duration-300 group overflow-hidden"
                  >
                    {tutorial.thumbnail_url && (
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={tutorial.thumbnail_url} 
                          alt={tutorial.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Youtube className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{tutorial.subject}</Badge>
                          {tutorial.difficulty && (
                            <Badge className={
                              tutorial.difficulty === "beginner" ? "bg-green-500/20 text-green-400" :
                              tutorial.difficulty === "intermediate" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-red-500/20 text-red-400"
                            }>
                              {tutorial.difficulty}
                            </Badge>
                          )}
                        </div>
                        <SaveToggle itemType="tutorial" itemId={tutorial.id} />
                      </div>
                      <CardTitle className="text-foreground font-serif text-lg mt-3 line-clamp-2">
                        {tutorial.title}
                      </CardTitle>
                      {tutorial.description && (
                        <p className="text-muted-foreground text-sm line-clamp-2 mt-2">
                          {tutorial.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            className={`inline-flex items-center gap-1 ${
                              userLiked[tutorial.id] ? "text-primary" : "hover:text-primary"
                            }`}
                            onClick={() => handleToggleLike(tutorial.id)}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span>{tutorial.like_count}</span>
                          </button>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{tutorial.view_count}</span>
                          </span>
                          {tutorial.duration_minutes && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{tutorial.duration_minutes} min</span>
                            </span>
                          )}
                        </div>
                        {user?.id === tutorial.user_id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="glass-dark border-border/50">
                              <DropdownMenuItem onClick={() => handleEdit(tutorial)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(tutorial.id)} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleView(tutorial)}
                      >
                        <Youtube className="w-4 h-4 mr-2" />
                        Watch on YouTube
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!loading && sortedTutorials.length === 0 && (
            <div className="text-center py-16">
              <Youtube className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl text-foreground mb-2">No tutorials found</h3>
              <p className="text-muted-foreground">Be the first to share a tutorial!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default YouTubeTutorials;

