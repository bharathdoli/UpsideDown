import { useState, useEffect, useRef } from "react";
import { Search, Filter, BookOpen, Download, Eye, ChevronDown, Upload, X, Loader2, Trash2, Edit } from "lucide-react";
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

const subjects = ["All Subjects", "Computer Science", "Mathematics", "Electronics", "Physics", "Chemistry", "Mechanical", "Civil"];

interface Note {
  id: string;
  title: string;
  subject: string;
  branch?: string | null;
  description: string | null;
  file_url: string | null;
  created_at: string;
  user_id: string;
  college: string;
}

const Notes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [college, setCollege] = useState<string | null>(null);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    branch: "",
    description: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchUserProfile();
  }, [user, navigate]);

  useEffect(() => {
    if (college) {
      fetchNotes();
      fetchBranches();
    }
  }, [college]);

  const fetchBranches = async () => {
    if (!college) return;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("branch")
      .eq("college", college)
      .not("branch", "is", null);

    if (error) {
      console.error("Error fetching branches:", error);
      return;
    }

    const uniqueBranches = Array.from(new Set((data || []).map(p => p.branch).filter(Boolean) as string[])).sort();
    setAvailableBranches(uniqueBranches);
  };

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

  const fetchNotes = async () => {
    if (!college) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("college", college)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching notes", description: error.message, variant: "destructive" });
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  };

  const handleCollegeChange = (newCollege: string) => {
    setCollege(newCollege);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDownload = async (note: Note) => {
    if (!note.file_url) return;
    
    try {
      const response = await fetch(note.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileExt = note.file_url.split(".").pop() || "pdf";
      a.download = `${note.title}.${fileExt}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Download started!" });
    } catch (error) {
      toast({ title: "Error downloading file", variant: "destructive" });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login to upload notes", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!college) {
      toast({ title: "Please select a college first", variant: "destructive" });
      return;
    }

    if (!formData.title || !formData.subject) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    setUploading(true);
    let fileUrl = editingNote?.file_url || null;

    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("notes")
        .upload(fileName, selectedFile);

      if (uploadError) {
        toast({ title: "Error uploading file", description: uploadError.message, variant: "destructive" });
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("notes").getPublicUrl(fileName);
      fileUrl = urlData.publicUrl;
    }

    if (editingNote) {
      const { error } = await supabase.from("notes").update({
        title: formData.title,
        subject: formData.subject,
        branch: formData.branch || null,
        description: formData.description,
        file_url: fileUrl,
      }).eq("id", editingNote.id);

      if (error) {
        toast({ title: "Error updating note", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Note updated successfully!" });
      }
    } else {
      const { error } = await supabase.from("notes").insert({
        title: formData.title,
        subject: formData.subject,
        branch: formData.branch || null,
        description: formData.description,
        file_url: fileUrl,
        user_id: user.id,
        college: college,
      });

      if (error) {
        toast({ title: "Error saving note", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Note uploaded successfully!" });
      }
    }

    setIsDialogOpen(false);
    setFormData({ title: "", subject: "", branch: "", description: "" });
    setSelectedFile(null);
    setEditingNote(null);
    fetchNotes();
    setUploading(false);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      subject: note.subject,
      branch: note.branch || "",
      description: note.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    
    const { error } = await supabase.from("notes").delete().eq("id", noteId);
    if (error) {
      toast({ title: "Error deleting note", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Note deleted successfully!" });
      fetchNotes();
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All Subjects" || note.subject === selectedSubject;
    const matchesBranch = selectedBranch === "All Branches" || note.branch === selectedBranch;
    return matchesSearch && matchesSubject && matchesBranch;
  });

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

  const getFileExtension = (url: string | null) => {
    if (!url) return "FILE";
    const ext = url.split(".").pop()?.toUpperCase() || "FILE";
    return ext.substring(0, 4);
  };

  return (
    <div id="notes" className="min-h-screen bg-background noise">
      <DashboardNavbar college={college} onCollegeChange={handleCollegeChange} />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-stranger text-4xl md:text-5xl text-foreground mb-4">
              Notes & <span className="text-primary text-glow-subtle">Past Papers</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              {college ? (
                <>Access study materials from <span className="text-primary">{college}</span></>
              ) : (
                <>Select your college to see notes</>
              )}
            </p>
          </div>

          {!college && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl text-foreground mb-2">No college selected</h3>
              <p className="text-muted-foreground">Please select your college from the dropdown in the navbar</p>
            </div>
          )}

          {college && (
            <>
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search notes, subjects, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-card border-border/50 focus:border-primary"
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-border/50">
                      <Filter className="w-4 h-4 mr-2" />
                      {selectedSubject}
                      <ChevronDown className="ml-2 w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-dark border-border/50">
                    {subjects.map((subject) => (
                      <DropdownMenuItem
                        key={subject}
                        onClick={() => setSelectedSubject(subject)}
                        className="hover:bg-primary/10 cursor-pointer"
                      >
                        {subject}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-border/50">
                      {selectedBranch}
                      <ChevronDown className="ml-2 w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-dark border-border/50">
                    <DropdownMenuItem
                      onClick={() => setSelectedBranch("All Branches")}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      All Branches
                    </DropdownMenuItem>
                    {availableBranches.map((branch) => (
                      <DropdownMenuItem
                        key={branch}
                        onClick={() => setSelectedBranch(branch)}
                        className="hover:bg-primary/10 cursor-pointer"
                      >
                        {branch}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setEditingNote(null);
                    setFormData({ title: "", subject: "", branch: "", description: "" });
                    setSelectedFile(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Notes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-dark border-border/50">
                    <DialogHeader>
                      <DialogTitle className="font-stranger text-foreground">
                        {editingNote ? "Edit Notes" : "Upload Notes"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g., Data Structures Notes"
                          className="bg-background/50 border-border/50"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="subject">Subject *</Label>
                          <select
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full h-10 rounded-md border border-border/50 bg-background/50 px-3 text-sm"
                          >
                            <option value="">Select subject</option>
                            {subjects.filter(s => s !== "All Subjects").map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="branch">Branch</Label>
                          <select
                            id="branch"
                            value={formData.branch}
                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                            className="w-full h-10 rounded-md border border-border/50 bg-background/50 px-3 text-sm"
                          >
                            <option value="">Select branch</option>
                            {availableBranches.map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Brief description of the notes..."
                          className="bg-background/50 border-border/50"
                        />
                      </div>
                      <div>
                        <Label>Upload File (PDF, DOC, DOCX, PPT, etc.)</Label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                          className="hidden"
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        >
                          {selectedFile ? (
                            <div className="flex items-center justify-center gap-2">
                              <BookOpen className="w-5 h-5 text-primary" />
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
                          ) : editingNote?.file_url ? (
                            <p className="text-sm text-muted-foreground">Current file attached. Click to replace.</p>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload PDF, DOC, PPT, etc.</p>
                            </>
                          )}
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-primary" disabled={uploading}>
                        {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {editingNote ? "Updating..." : "Uploading..."}</> : editingNote ? "Update Notes" : "Upload Notes"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Notes Grid */}
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNotes.map((note) => (
                    <Card 
                      key={note.id}
                      className="glass-dark border-border/30 hover-glow transition-all duration-300 group"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-secondary/50">
                              {getFileExtension(note.file_url)}
                            </Badge>
                            {user?.id === note.user_id && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="glass-dark border-border/50">
                                  <DropdownMenuItem onClick={() => handleEdit(note)}>
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(note.id)} className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-foreground font-serif text-lg mt-3 line-clamp-2">
                          {note.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {note.subject} {note.branch ? `• ${note.branch}` : ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {note.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{note.description}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <span>Uploaded</span>
                          <span>{formatDate(note.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {note.file_url && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-border/50"
                                onClick={() => window.open(note.file_url!, "_blank")}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                                onClick={() => handleDownload(note)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!loading && filteredNotes.length === 0 && (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl text-foreground mb-2">No notes found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters, or upload the first note!</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Notes;
