import { useState, useEffect } from "react";
import { Search, GraduationCap, Linkedin, Mail, Filter, Plus, Loader2, Edit, Trash2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const industries = [
  "All Industries",
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Consulting",
  "Manufacturing",
  "Media",
  "Government",
];

interface Alumni {
  id: string;
  name: string;
  graduation_year: number;
  company: string | null;
  role: string | null;
  bio: string | null;
  linkedin_url: string | null;
  email: string | null;
  college: string;
  user_id: string;
  created_at: string;
  industry: string | null;
}

const AlumniConnect = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<Alumni | null>(null);
  const [college, setCollege] = useState<string | null>(null);
  const [userCollege, setUserCollege] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    graduation_year: "",
    company: "",
    role: "",
    bio: "",
    linkedin_url: "",
    email: "",
    industry: "",
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
      fetchAlumni();
    }
  }, [college]);

  const handleCollegeChange = (newCollege: string) => {
    setCollege(newCollege);
  };

  const fetchAlumni = async () => {
    if (!college) return;
    
    setLoading(true);
    let query = supabase
      .from("alumni")
      .select("*");

    // Only filter by college if not "All Colleges"
    if (college !== "All Colleges") {
      query = query.eq("college", college);
    }

    const { data, error } = await query.order("graduation_year", { ascending: false });

    if (error) {
      toast({ title: "Error fetching alumni", description: error.message, variant: "destructive" });
    } else {
      setAlumni(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please login to add your profile", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (profileLoading) {
      toast({ title: "Please wait", description: "Loading your profile...", variant: "default" });
      return;
    }

    if (!formData.name || !formData.graduation_year) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    if (!formData.email && !formData.linkedin_url) {
      toast({ title: "Please provide at least one contact method (email or LinkedIn)", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const alumniData = {
      name: formData.name,
      graduation_year: parseInt(formData.graduation_year),
      company: formData.company || null,
      role: formData.role || null,
      bio: formData.bio || null,
      linkedin_url: formData.linkedin_url || null,
      email: formData.email || null,
      industry: formData.industry || null,
    };

    if (editingAlumni) {
      const { error } = await supabase.from("alumni").update(alumniData).eq("id", editingAlumni.id);
      if (error) {
        toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Alumni profile updated!" });
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

      const { error } = await supabase.from("alumni").insert({
        ...alumniData,
        user_id: user.id,
        college: userCollege,
      });
      if (error) {
        toast({ title: "Error creating profile", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Alumni profile created!" });
      }
    }

    setIsDialogOpen(false);
    resetForm();
    fetchAlumni();
    setSubmitting(false);
  };

  const resetForm = () => {
    setFormData({ name: "", graduation_year: "", company: "", role: "", bio: "", linkedin_url: "", email: "", industry: "" });
    setEditingAlumni(null);
  };

  const handleEdit = (alum: Alumni) => {
    setEditingAlumni(alum);
    setFormData({
      name: alum.name,
      graduation_year: alum.graduation_year.toString(),
      company: alum.company || "",
      role: alum.role || "",
      bio: alum.bio || "",
      linkedin_url: alum.linkedin_url || "",
      email: alum.email || "",
      industry: alum.industry || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (alumniId: string) => {
    if (!confirm("Are you sure you want to delete this profile?")) return;
    
    // Note: DELETE policy doesn't exist for alumni table, this will fail
    // User should update to remove their data instead
    toast({ title: "Alumni profiles cannot be deleted. Please contact support.", variant: "destructive" });
  };

  const handleConnect = (alum: Alumni) => {
    if (alum.email) {
      window.open(`mailto:${alum.email}?subject=Connection Request from Campus Upside Down&body=Hi ${alum.name},%0D%0A%0D%0AI found your profile on Campus Upside Down and would love to connect with you.%0D%0A%0D%0ABest regards`);
    } else if (alum.linkedin_url) {
      window.open(alum.linkedin_url, "_blank");
    } else {
      toast({ title: "No contact information available", variant: "destructive" });
    }
  };

  const filteredAlumni = alumni.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (a.role?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesIndustry = selectedIndustry === "All Industries" || a.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="min-h-screen bg-background noise-overlay">
      <DashboardNavbar college={college} onCollegeChange={handleCollegeChange} />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-stranger text-foreground mb-4 flicker">
              Alumni <span className="text-primary">Connect</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with successful alumni for mentorship, career guidance, and networking opportunities.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Total Alumni", value: alumni.length.toString(), icon: "🎓" },
              { label: "Companies", value: new Set(alumni.map(a => a.company).filter(Boolean)).size.toString(), icon: "🏢" },
              { label: "Mentors", value: "Available", icon: "🤝" },
              { label: "Countries", value: "10+", icon: "🌍" },
            ].map((stat, idx) => (
              <div key={idx} className="glass-dark rounded-xl p-4 text-center border border-border/30">
                <span className="text-3xl mb-2 block">{stat.icon}</span>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Add Alumni Button */}
          <div className="flex justify-center mb-8">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground box-glow gap-2" size="lg">
                  <Plus className="w-5 h-5" />
                  Add Your Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-dark border-border/50 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-stranger text-foreground">
                    {editingAlumni ? "Edit Profile" : "Alumni Profile"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="graduation_year">Graduation Year *</Label>
                    <Input
                      id="graduation_year"
                      type="number"
                      value={formData.graduation_year}
                      onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                      placeholder="2020"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Company name"
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="Your role"
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Contact Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={formData.industry} onValueChange={(v) => setFormData({ ...formData, industry: v })}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="glass-dark border-border/50">
                        {industries.filter(i => i !== "All Industries").map(ind => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary" disabled={submitting}>
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : editingAlumni ? "Update Profile" : "Create Profile"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search & Filters */}
          <div className="glass-dark rounded-xl p-4 mb-8 border border-border/30">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, company, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                />
              </div>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-full md:w-48 bg-background/50 border-border/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent className="glass-dark border-border/50">
                  {industries.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alumni Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlumni.map(a => (
                <div 
                  key={a.id}
                  className="glass-dark rounded-xl p-6 border border-border/30 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-3xl border border-border/50">
                      👤
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {a.name}
                        </h3>
                        {user?.id === a.user_id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="glass-dark border-border/50">
                              <DropdownMenuItem onClick={() => handleEdit(a)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{a.role || "Alumni"}</p>
                      <p className="text-sm text-primary">{a.company || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4" />
                      <span>Batch {a.graduation_year}</span>
                    </div>
                    {a.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{a.bio}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {a.linkedin_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-border/50 hover:border-primary/50 gap-1"
                        onClick={() => window.open(a.linkedin_url!, "_blank")}
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      className="flex-1 bg-primary hover:bg-primary/90 gap-1"
                      onClick={() => handleConnect(a)}
                    >
                      <Mail className="w-4 h-4" />
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredAlumni.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No alumni found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AlumniConnect;