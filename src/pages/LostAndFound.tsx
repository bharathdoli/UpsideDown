import { useState, useEffect, useRef } from "react";
import { Search, Plus, Filter, X, Loader2, Upload, Edit, Trash2, MapPin, Phone, Mail, CheckCircle, Clock } from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SaveToggle } from "@/components/ui/save-toggle";

const categories = ["All", "Electronics", "Books", "Clothing", "Accessories", "ID Cards", "Keys", "Other"];

interface LostFoundItem {
  id: string;
  user_id: string;
  college: string;
  item_type: "lost" | "found";
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  contact_info: string | null;
  image_url: string | null;
  status: "active" | "resolved" | "claimed";
  created_at: string;
  updated_at: string;
}

const LostAndFound = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState<"lost" | "found" | "all">("all");
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingItem, setEditingItem] = useState<LostFoundItem | null>(null);
  const [college, setCollege] = useState<string | null>(null);
  const [userCollege, setUserCollege] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    item_type: "lost" as "lost" | "found",
    title: "",
    description: "",
    category: "",
    location: "",
    contact_info: "",
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
      fetchItems();
    }
  }, [college]);

  const handleCollegeChange = (newCollege: string) => {
    setCollege(newCollege);
  };

  const fetchItems = async () => {
    if (!college) return;
    
    setLoading(true);
    let query = supabase
      .from("lost_and_found")
      .select("*")
      .eq("status", "active");

    // Only filter by college if not "All Colleges"
    if (college !== "All Colleges") {
      query = query.eq("college", college);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching items", description: error.message, variant: "destructive" });
    } else {
      const typedData = (data || []).map(item => ({
        ...item,
        item_type: item.item_type as "lost" | "found",
        status: item.status as "active" | "resolved" | "claimed"
      })) as LostFoundItem[];
      setItems(typedData);
    }
    setLoading(false);
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

    if (!formData.title) {
      toast({ title: "Please enter a title", variant: "destructive" });
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
      setUploading(false);
      return;
    }

    setUploading(true);
    let imageUrl = editingItem?.image_url || null;

    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("lost-found")
        .upload(fileName, selectedFile);

      if (uploadError) {
        toast({ title: "Error uploading image", description: uploadError.message, variant: "destructive" });
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("lost-found").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    if (editingItem) {
      const { error } = await supabase.from("lost_and_found").update({
        title: formData.title,
        description: formData.description || null,
        category: formData.category || null,
        location: formData.location || null,
        contact_info: formData.contact_info || null,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      }).eq("id", editingItem.id);

      if (error) {
        toast({ title: "Error updating item", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Item updated successfully!" });
      }
    } else {
      const { error } = await supabase.from("lost_and_found").insert({
        item_type: formData.item_type,
        title: formData.title,
        description: formData.description || null,
        category: formData.category || null,
        location: formData.location || null,
        contact_info: formData.contact_info || null,
        image_url: imageUrl,
        user_id: user.id,
        college: userCollege,
      });
      if (error) {
        toast({ title: "Error posting item", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Item posted successfully!" });
      }
    }

    setIsDialogOpen(false);
    resetForm();
    fetchItems();
    setUploading(false);
  };

  const resetForm = () => {
    setFormData({ item_type: "lost", title: "", description: "", category: "", location: "", contact_info: "" });
    setSelectedFile(null);
    setEditingItem(null);
  };

  const handleEdit = (item: LostFoundItem) => {
    setEditingItem(item);
    setFormData({
      item_type: item.item_type,
      title: item.title,
      description: item.description || "",
      category: item.category || "",
      location: item.location || "",
      contact_info: item.contact_info || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    const { error } = await supabase.from("lost_and_found").delete().eq("id", itemId);
    if (error) {
      toast({ title: "Error deleting item", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Item deleted successfully!" });
      fetchItems();
    }
  };

  const handleMarkResolved = async (itemId: string) => {
    const { error } = await supabase
      .from("lost_and_found")
      .update({ status: "resolved", updated_at: new Date().toISOString() })
      .eq("id", itemId);

    if (error) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Item marked as resolved!" });
      fetchItems();
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesType = selectedType === "all" || item.item_type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
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

  return (
    <div className="min-h-screen bg-background noise">
      <DashboardNavbar college={college} onCollegeChange={handleCollegeChange} />
      
      <main className="pt-20 sm:pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-stranger text-4xl md:text-5xl text-foreground mb-4">
              Lost & <span className="text-primary text-glow-subtle">Found</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Lost something? Found something? Help reunite items with their owners.
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as "lost" | "found" | "all")} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 glass-dark">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
              <TabsTrigger value="found">Found</TabsTrigger>
            </TabsList>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border/50 focus:border-primary"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 border-border/50">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="glass-dark border-border/50">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Item
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-dark border-border/50 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-stranger text-foreground">
                    {editingItem ? "Edit Item" : "Post Lost/Found Item"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Type *</Label>
                    <Select value={formData.item_type} onValueChange={(v) => setFormData({ ...formData, item_type: v as "lost" | "found" })}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lost">Lost</SelectItem>
                        <SelectItem value="found">Found</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Lost iPhone 13"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the item..."
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c !== "All").map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Where was it lost/found?"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_info">Contact Info</Label>
                    <Input
                      id="contact_info"
                      value={formData.contact_info}
                      onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                      placeholder="Phone or email"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div>
                    <Label>Image</Label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-sm text-foreground">{selectedFile.name}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : editingItem?.image_url ? (
                        <p className="text-sm text-muted-foreground">Current image attached. Click to replace.</p>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload image</p>
                        </>
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary" disabled={uploading}>
                    {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {editingItem ? "Updating..." : "Posting..."}</> : editingItem ? "Update Item" : "Post Item"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            </div>

            {/* Items Grid */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <TabsContent value="all" className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredItems.map((item) => (
                      <Card 
                        key={item.id}
                        className="glass-dark border-border/30 hover-glow transition-all duration-300 group overflow-hidden"
                      >
                        {item.image_url && (
                          <div className="h-40 overflow-hidden">
                            <img 
                              src={item.image_url} 
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={item.item_type === "lost" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}>
                                {item.item_type === "lost" ? "Lost" : "Found"}
                              </Badge>
                              {item.category && (
                                <Badge variant="outline">{item.category}</Badge>
                              )}
                            </div>
                            <SaveToggle itemType="lost_found" itemId={item.id} />
                          </div>
                          <CardTitle className="text-foreground font-serif text-lg mt-3">
                            {item.title}
                          </CardTitle>
                          {item.description && (
                            <p className="text-muted-foreground text-sm line-clamp-2 mt-2">
                              {item.description}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-muted-foreground mb-4">
                            {item.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary/70" />
                                <span>{item.location}</span>
                              </div>
                            )}
                            {item.contact_info && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary/70" />
                                <span>{item.contact_info}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary/70" />
                              <span>{formatDate(item.created_at)}</span>
                            </div>
                          </div>
                          {user?.id === item.user_id && (
                            <div className="flex gap-2 mb-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleMarkResolved(item.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Resolved
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {item.contact_info && (
                            <Button 
                              variant="outline" 
                              className="w-full border-border/50 hover:bg-primary/10 hover:border-primary/50"
                              onClick={() => {
                                if (item.contact_info?.includes("@")) {
                                  window.open(`mailto:${item.contact_info}`);
                                } else {
                                  window.open(`tel:${item.contact_info}`);
                                }
                              }}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Contact
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="lost" className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredItems.filter(item => item.item_type === "lost").map((item) => (
                      <Card 
                        key={item.id}
                        className="glass-dark border-border/30 hover-glow transition-all duration-300 group overflow-hidden"
                      >
                        {item.image_url && (
                          <div className="h-40 overflow-hidden">
                            <img 
                              src={item.image_url} 
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={item.item_type === "lost" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}>
                                {item.item_type === "lost" ? "Lost" : "Found"}
                              </Badge>
                              {item.category && (
                                <Badge variant="outline">{item.category}</Badge>
                              )}
                            </div>
                            <SaveToggle itemType="lost_found" itemId={item.id} />
                          </div>
                          <CardTitle className="text-foreground font-serif text-lg mt-3">
                            {item.title}
                          </CardTitle>
                          {item.description && (
                            <p className="text-muted-foreground text-sm line-clamp-2 mt-2">
                              {item.description}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-muted-foreground mb-4">
                            {item.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary/70" />
                                <span>{item.location}</span>
                              </div>
                            )}
                            {item.contact_info && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary/70" />
                                <span>{item.contact_info}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary/70" />
                              <span>{formatDate(item.created_at)}</span>
                            </div>
                          </div>
                          {user?.id === item.user_id && (
                            <div className="flex gap-2 mb-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleMarkResolved(item.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Resolved
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {item.contact_info && (
                            <Button 
                              variant="outline" 
                              className="w-full border-border/50 hover:bg-primary/10 hover:border-primary/50"
                              onClick={() => {
                                if (item.contact_info?.includes("@")) {
                                  window.open(`mailto:${item.contact_info}`);
                                } else {
                                  window.open(`tel:${item.contact_info}`);
                                }
                              }}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Contact
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="found" className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredItems.filter(item => item.item_type === "found").map((item) => (
                      <Card 
                        key={item.id}
                        className="glass-dark border-border/30 hover-glow transition-all duration-300 group overflow-hidden"
                      >
                        {item.image_url && (
                          <div className="h-40 overflow-hidden">
                            <img 
                              src={item.image_url} 
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={item.item_type === "lost" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}>
                                {item.item_type === "lost" ? "Lost" : "Found"}
                              </Badge>
                              {item.category && (
                                <Badge variant="outline">{item.category}</Badge>
                              )}
                            </div>
                            <SaveToggle itemType="lost_found" itemId={item.id} />
                          </div>
                          <CardTitle className="text-foreground font-serif text-lg mt-3">
                            {item.title}
                          </CardTitle>
                          {item.description && (
                            <p className="text-muted-foreground text-sm line-clamp-2 mt-2">
                              {item.description}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-muted-foreground mb-4">
                            {item.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary/70" />
                                <span>{item.location}</span>
                              </div>
                            )}
                            {item.contact_info && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary/70" />
                                <span>{item.contact_info}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary/70" />
                              <span>{formatDate(item.created_at)}</span>
                            </div>
                          </div>
                          {user?.id === item.user_id && (
                            <div className="flex gap-2 mb-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleMarkResolved(item.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Resolved
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {item.contact_info && (
                            <Button 
                              variant="outline" 
                              className="w-full border-border/50 hover:bg-primary/10 hover:border-primary/50"
                              onClick={() => {
                                if (item.contact_info?.includes("@")) {
                                  window.open(`mailto:${item.contact_info}`);
                                } else {
                                  window.open(`tel:${item.contact_info}`);
                                }
                              }}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Contact
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </>
            )}

            {!loading && filteredItems.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No items found matching your criteria.</p>
              </div>
            )}
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LostAndFound;

