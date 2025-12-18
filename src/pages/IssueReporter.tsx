import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Camera, MapPin, Send, CheckCircle, Clock, XCircle, Loader2, X, Edit, Trash2, MessageSquare } from "lucide-react";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const categories = [
  "Infrastructure",
  "Electricity",
  "Water Supply",
  "Cleanliness",
  "Security",
  "Hostel",
  "Canteen",
  "Library",
  "Labs",
  "Other",
];

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  college: string;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "in-progress":
      return <AlertTriangle className="w-4 h-4" />;
    case "resolved":
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <XCircle className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-warning/20 text-warning border-warning/30";
    case "in-progress":
      return "bg-secondary/20 text-secondary border-secondary/30";
    case "resolved":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const IssueReporter = () => {
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [college, setCollege] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (college) {
      fetchIssues();
    }
  }, [college]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("college")
      .eq("user_id", user.id)
      .single();

    if (data?.college) {
      setCollege(data.college);
    } else {
      setLoading(false);
    }
  };

  const handleCollegeChange = (newCollege: string) => {
    setCollege(newCollege);
  };

  const fetchIssues = async () => {
    if (!college) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("college", college)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching issues", description: error.message, variant: "destructive" });
    } else {
      setIssues(data || []);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login to report issues", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!formData.title || !formData.category || !formData.description) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    let imageUrl = editingIssue?.image_url || null;

    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("issues")
        .upload(fileName, selectedFile);

      if (uploadError) {
        toast({ title: "Error uploading image", description: uploadError.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("issues").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    if (editingIssue) {
      const { error } = await supabase.from("issues").update({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        image_url: imageUrl,
      }).eq("id", editingIssue.id);

      if (error) {
        toast({ title: "Error updating issue", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Issue updated successfully!" });
      }
    } else {
      if (!college) {
        toast({ title: "Please select a college first", variant: "destructive" });
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("issues").insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        image_url: imageUrl,
        user_id: user.id,
        college: college,
      });

      if (error) {
        toast({ title: "Error reporting issue", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Issue reported successfully!" });
      }
    }

    setShowForm(false);
    resetForm();
    fetchIssues();
    setSubmitting(false);
  };

  const resetForm = () => {
    setFormData({ title: "", category: "", location: "", description: "" });
    setSelectedFile(null);
    setEditingIssue(null);
  };

  const handleEdit = (issue: Issue) => {
    setEditingIssue(issue);
    setFormData({
      title: issue.title,
      category: issue.category,
      location: "",
      description: issue.description,
    });
    setShowForm(true);
  };

  const handleMarkResolved = async () => {
    if (!selectedIssue || !user) return;
    
    const { error } = await supabase.from("issues").update({
      status: "resolved",
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
      resolution_notes: resolutionNotes || null,
    }).eq("id", selectedIssue.id);

    if (error) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Issue marked as resolved!" });
      setDetailsDialogOpen(false);
      setResolutionNotes("");
      fetchIssues();
    }
  };

  const handleUpdateStatus = async (issueId: string, newStatus: string) => {
    const { error } = await supabase.from("issues").update({
      status: newStatus,
    }).eq("id", issueId);

    if (error) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Issue marked as ${newStatus}!` });
      fetchIssues();
    }
  };

  const filteredIssues = filterStatus === "all" 
    ? issues 
    : issues.filter(issue => issue.status === filterStatus);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div id="issue-reporter" className="min-h-screen bg-background noise-overlay">
      <DashboardNavbar college={college} onCollegeChange={handleCollegeChange} />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-stranger text-foreground mb-4 flicker">
              Issue <span className="text-primary">Reporter</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Report campus problems and track their resolution. Your voice matters in making the campus better.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Issues are reviewed by campus authorities. The person who reported can also mark them as resolved.
            </p>
          </div>

          {/* Report Button */}
          <div className="flex justify-center mb-8">
            <Button 
              onClick={() => {
                if (showForm && editingIssue) {
                  resetForm();
                }
                setShowForm(!showForm);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground box-glow gap-2"
              size="lg"
            >
              <AlertTriangle className="w-5 h-5" />
              {showForm ? "Close Form" : "Report an Issue"}
            </Button>
          </div>

          {/* Report Form */}
          {showForm && (
            <div className="max-w-2xl mx-auto mb-12 glass-dark rounded-xl p-6 border border-border/30 animate-fade-in">
              <h2 className="text-xl font-stranger text-foreground mb-6">
                {editingIssue ? "Edit Issue" : "Report New Issue"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Issue Title *</label>
                  <Input 
                    placeholder="Brief description of the issue..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Category *</label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="glass-dark border-border/50">
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Where is the issue?"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="bg-background/50 border-border/50 pl-10 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Detailed Description *</label>
                  <Textarea 
                    placeholder="Describe the issue in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-background/50 border-border/50 focus:border-primary min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Attach Photo (Optional)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
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
                    ) : editingIssue?.image_url ? (
                      <p className="text-sm text-muted-foreground">Current image attached. Click to replace.</p>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      </>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 gap-2" disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> {editingIssue ? "Update Issue" : "Submit Report"}</>}
                </Button>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {["all", "pending", "in-progress", "resolved"].map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className={filterStatus === status ? "bg-primary" : "border-border/50"}
              >
                {status === "all" ? "All Issues" : status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
              </Button>
            ))}
          </div>

          {/* Issues List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 max-w-4xl mx-auto">
              {filteredIssues.map(issue => (
                <div 
                  key={issue.id}
                  className="glass-dark rounded-xl p-6 border border-border/30 hover:border-primary/30 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Badge variant="outline" className={getStatusColor(issue.status)}>
                          {getStatusIcon(issue.status)}
                          <span className="ml-1 capitalize">{issue.status.replace("-", " ")}</span>
                        </Badge>
                        <Badge variant="outline" className="border-border/50 text-muted-foreground">
                          {issue.category}
                        </Badge>
                        {user?.id === issue.user_id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="glass-dark border-border/50">
                              <DropdownMenuItem onClick={() => handleEdit(issue)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              {issue.status !== "resolved" && (
                                <DropdownMenuItem onClick={() => {
                                  setSelectedIssue(issue);
                                  setDetailsDialogOpen(true);
                                }}>
                                  <CheckCircle className="w-4 h-4 mr-2" /> Mark Resolved
                                </DropdownMenuItem>
                              )}
                              {issue.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(issue.id, "in-progress")}>
                                  <AlertTriangle className="w-4 h-4 mr-2" /> Mark In Progress
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {issue.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{issue.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Reported: {formatDate(issue.created_at)}</span>
                        {issue.resolved_at && (
                          <span className="text-green-400">Resolved: {formatDate(issue.resolved_at)}</span>
                        )}
                      </div>
                      {issue.resolution_notes && (
                        <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                          <p className="text-sm text-green-400 flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{issue.resolution_notes}</span>
                          </p>
                        </div>
                      )}
                    </div>
                    {issue.image_url && (
                      <img 
                        src={issue.image_url} 
                        alt="Issue"
                        className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(issue.image_url!, "_blank")}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredIssues.length === 0 && (
            <div className="text-center py-16">
              <AlertTriangle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl text-foreground mb-2">No issues found</h3>
              <p className="text-muted-foreground">No issues have been reported yet.</p>
            </div>
          )}

          {/* Resolve Issue Dialog */}
          <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
            <DialogContent className="glass-dark border-border/50">
              <DialogHeader>
                <DialogTitle className="font-stranger text-foreground">Mark Issue as Resolved</DialogTitle>
              </DialogHeader>
              {selectedIssue && (
                <div className="space-y-4">
                  <div className="p-4 bg-background/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">{selectedIssue.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{selectedIssue.description}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Resolution Notes (Optional)</label>
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="How was this issue resolved?"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <Button onClick={handleMarkResolved} className="w-full bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Resolved
                  </Button>
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

export default IssueReporter;