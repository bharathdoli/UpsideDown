import { useState, useEffect, useRef } from "react";
import { Search, Plus, Tag, MessageCircle, Filter, X, Loader2, Upload, Edit, Trash2, Phone, Mail } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const categories = [
  "All",
  "Books & Notes",
  "Electronics",
  "Stationery",
  "Furniture",
  "Clothing",
  "Sports",
  "Others",
];

const conditions = ["Like New", "Good", "Used", "Fair"];

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  condition: string;
  image_url: string | null;
  is_sold: boolean | null;
  created_at: string;
  user_id: string;
  college: string;
  contact_email: string | null;
  contact_phone: string | null;
}

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceSort, setPriceSort] = useState("none");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    contact_email: "",
    contact_phone: "",
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("marketplace_listings")
      .select("*")
      .eq("is_sold", false)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching listings", description: error.message, variant: "destructive" });
    } else {
      setListings(data || []);
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
      toast({ title: "Please login to sell items", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!formData.title || !formData.price || !formData.category || !formData.condition) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    if (!formData.contact_email && !formData.contact_phone) {
      toast({ title: "Please provide at least one contact method (email or phone)", variant: "destructive" });
      return;
    }

    setUploading(true);
    let imageUrl = editingListing?.image_url || null;

    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("marketplace")
        .upload(fileName, selectedFile);

      if (uploadError) {
        toast({ title: "Error uploading image", description: uploadError.message, variant: "destructive" });
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("marketplace").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const listingData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      condition: formData.condition,
      image_url: imageUrl,
      contact_email: formData.contact_email || null,
      contact_phone: formData.contact_phone || null,
    };

    if (editingListing) {
      const { error } = await supabase.from("marketplace_listings").update(listingData).eq("id", editingListing.id);
      if (error) {
        toast({ title: "Error updating listing", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Listing updated successfully!" });
      }
    } else {
      const { error } = await supabase.from("marketplace_listings").insert({
        ...listingData,
        user_id: user.id,
        college: "default",
      });
      if (error) {
        toast({ title: "Error creating listing", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Listing created successfully!" });
      }
    }

    setIsDialogOpen(false);
    resetForm();
    fetchListings();
    setUploading(false);
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", price: "", category: "", condition: "", contact_email: "", contact_phone: "" });
    setSelectedFile(null);
    setEditingListing(null);
  };

  const handleEdit = (listing: Listing) => {
    setEditingListing(listing);
    setFormData({
      title: listing.title,
      description: listing.description || "",
      price: listing.price.toString(),
      category: listing.category,
      condition: listing.condition,
      contact_email: listing.contact_email || "",
      contact_phone: listing.contact_phone || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    
    const { error } = await supabase.from("marketplace_listings").delete().eq("id", listingId);
    if (error) {
      toast({ title: "Error deleting listing", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Listing deleted successfully!" });
      fetchListings();
    }
  };

  const handleMarkSold = async (listingId: string) => {
    const { error } = await supabase.from("marketplace_listings").update({ is_sold: true }).eq("id", listingId);
    if (error) {
      toast({ title: "Error updating listing", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Item marked as sold!" });
      fetchListings();
    }
  };

  let filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (priceSort === "low") {
    filteredListings = [...filteredListings].sort((a, b) => Number(a.price) - Number(b.price));
  } else if (priceSort === "high") {
    filteredListings = [...filteredListings].sort((a, b) => Number(b.price) - Number(a.price));
  }

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
      <DashboardNavbar college={null} onCollegeChange={() => {}} />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-stranger text-foreground mb-4 flicker">
              Campus <span className="text-primary">Marketplace</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Buy and sell books, electronics, and more within your campus community.
            </p>
          </div>

          {/* Sell Button */}
          <div className="flex justify-center mb-8">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground box-glow gap-2" size="lg">
                  <Plus className="w-5 h-5" />
                  Sell Something
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-dark border-border/50 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-stranger text-foreground">
                    {editingListing ? "Edit Listing" : "Create Listing"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Item Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Engineering Textbook"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="250"
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="glass-dark border-border/50">
                          {categories.filter(c => c !== "All").map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <Select value={formData.condition} onValueChange={(v) => setFormData({ ...formData, condition: v })}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent className="glass-dark border-border/50">
                        {conditions.map(cond => (
                          <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_email">Contact Email *</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        placeholder="your@email.com"
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
                      placeholder="Describe your item..."
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div>
                    <Label>Item Image</Label>
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
                      ) : editingListing?.image_url ? (
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
                    {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {editingListing ? "Updating..." : "Creating..."}</> : editingListing ? "Update Listing" : "Create Listing"}
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
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 bg-background/50 border-border/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="glass-dark border-border/50">
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priceSort} onValueChange={setPriceSort}>
                <SelectTrigger className="w-full md:w-48 bg-background/50 border-border/50">
                  <Tag className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by Price" />
                </SelectTrigger>
                <SelectContent className="glass-dark border-border/50">
                  <SelectItem value="none">Default</SelectItem>
                  <SelectItem value="low">Price: Low to High</SelectItem>
                  <SelectItem value="high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map(listing => (
                <div 
                  key={listing.id}
                  className="glass-dark rounded-xl overflow-hidden border border-border/30 hover:border-primary/30 transition-all group hover:transform hover:scale-[1.02]"
                >
                  {/* Image */}
                  <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden relative">
                    {listing.image_url ? (
                      <img 
                        src={listing.image_url} 
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-6xl">📦</span>
                    )}
                    {user?.id === listing.user_id && (
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-background/80">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glass-dark border-border/50">
                            <DropdownMenuItem onClick={() => handleEdit(listing)}>
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMarkSold(listing.id)}>
                              <Tag className="w-4 h-4 mr-2" /> Mark as Sold
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(listing.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {listing.title}
                    </h3>
                    
                    <p className="text-2xl font-bold text-primary mb-3">₹{listing.price}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="border-border/50 text-muted-foreground">
                        {listing.category}
                      </Badge>
                      <Badge variant="outline" className="border-secondary/50 text-secondary">
                        {listing.condition}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>Listed</span>
                      <span>{formatDate(listing.created_at)}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-border/50 hover:border-primary/50 gap-1"
                        onClick={() => {
                          if (listing.contact_phone) {
                            window.open(`tel:${listing.contact_phone}`);
                          } else if (listing.contact_email) {
                            window.open(`mailto:${listing.contact_email}`);
                          } else {
                            toast({ title: "No contact info available", variant: "destructive" });
                          }
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => {
                          setSelectedListing(listing);
                          setDetailsDialogOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredListings.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No items found matching your criteria.</p>
            </div>
          )}

          {/* Listing Details Dialog */}
          <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
            <DialogContent className="glass-dark border-border/50 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-stranger text-foreground text-2xl">{selectedListing?.title}</DialogTitle>
              </DialogHeader>
              {selectedListing && (
                <div className="space-y-4">
                  {selectedListing.image_url && (
                    <img 
                      src={selectedListing.image_url} 
                      alt={selectedListing.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold text-primary">₹{selectedListing.price}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="border-border/50">{selectedListing.category}</Badge>
                      <Badge variant="outline" className="border-secondary/50 text-secondary">{selectedListing.condition}</Badge>
                    </div>
                  </div>
                  {selectedListing.description && (
                    <div className="border-t border-border/30 pt-4">
                      <h4 className="font-semibold text-foreground mb-2">Description</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">{selectedListing.description}</p>
                    </div>
                  )}
                  <div className="border-t border-border/30 pt-4">
                    <h4 className="font-semibold text-foreground mb-3">Contact Seller</h4>
                    <div className="space-y-2">
                      {selectedListing.contact_email && (
                        <a 
                          href={`mailto:${selectedListing.contact_email}`}
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Mail className="w-5 h-5 text-primary" />
                          {selectedListing.contact_email}
                        </a>
                      )}
                      {selectedListing.contact_phone && (
                        <a 
                          href={`tel:${selectedListing.contact_phone}`}
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Phone className="w-5 h-5 text-primary" />
                          {selectedListing.contact_phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedListing.contact_phone && (
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => window.open(`https://wa.me/${selectedListing.contact_phone?.replace(/\D/g, '')}`)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    )}
                    {selectedListing.contact_email && (
                      <Button 
                        variant="outline"
                        className="flex-1 border-border/50"
                        onClick={() => window.open(`mailto:${selectedListing.contact_email}`)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
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

export default Marketplace;