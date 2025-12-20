import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SavedItemRow = {
  id: string;
  item_type: "note" | "event" | "listing" | "study_buddy" | "alumni" | "lost_found" | "tutorial";
  item_id: string;
};

type AnyItem = {
  id: string;
  title?: string;
  subject?: string;
  description?: string | null;
};

const Saved = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [college, setCollege] = useState<string | null>("All Colleges");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<SavedItemRow[]>([]);
  const [items, setItems] = useState<Record<string, AnyItem>>({});

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    void fetchSaved();
  }, [user, navigate]);

  const fetchSaved = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("saved_items")
      .select("id, item_type, item_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching saved items", error);
      setLoading(false);
      return;
    }

    const rows = (data || []) as SavedItemRow[];
    setSaved(rows);

    // Fetch minimal info per type
    const byType: Record<string, string[]> = {};
    rows.forEach((r) => {
      if (!byType[r.item_type]) byType[r.item_type] = [];
      byType[r.item_type].push(r.item_id);
    });

    const result: Record<string, AnyItem> = {};

    if (byType.note?.length) {
      const { data } = await supabase
        .from("notes")
        .select("id, title, subject, description")
        .in("id", byType.note);
      data?.forEach((n) => (result[n.id] = n as AnyItem));
    }

    if (byType.event?.length) {
      const { data } = await supabase
        .from("events")
        .select("id, title, description")
        .in("id", byType.event);
      data?.forEach((e) => (result[e.id] = e as AnyItem));
    }

    if (byType.listing?.length) {
      const { data } = await supabase
        .from("marketplace_listings")
        .select("id, title, description")
        .in("id", byType.listing);
      data?.forEach((l) => (result[l.id] = l as AnyItem));
    }

    if (byType.study_buddy?.length) {
      const { data } = await supabase
        .from("study_buddy_requests")
        .select("id, subject, description")
        .in("id", byType.study_buddy);
      data?.forEach((s) => (result[s.id] = s as AnyItem));
    }

    if (byType.alumni?.length) {
      const { data } = await supabase
        .from("alumni")
        .select("id, name, bio")
        .in("id", byType.alumni);
      data?.forEach((a) =>
        (result[a.id] = {
          id: a.id,
          title: a.name,
          description: a.bio,
        } as AnyItem)
      );
    }

    if (byType.lost_found?.length) {
      const { data } = await supabase
        .from("lost_and_found")
        .select("id, title, description")
        .in("id", byType.lost_found);
      data?.forEach((l) => (result[l.id] = l as AnyItem));
    }

    if (byType.tutorial?.length) {
      const { data } = await supabase
        .from("youtube_tutorials")
        .select("id, title, description")
        .in("id", byType.tutorial);
      data?.forEach((t) => (result[t.id] = t as AnyItem));
    }

    setItems(result);
    setLoading(false);
  };

  const handleCollegeChange = (newCollege: string) => {
    setCollege(newCollege);
  };

  const getTitle = (row: SavedItemRow, item: AnyItem | undefined) => {
    if (!item) return row.item_type;
    if (item.title) return item.title;
    if (item.subject) return item.subject;
    return row.item_type;
  };

  const getDescription = (item: AnyItem | undefined) => {
    if (!item) return "";
    return item.description || "";
  };

  const goToItem = (row: SavedItemRow) => {
    switch (row.item_type) {
      case "note":
        navigate("/notes");
        break;
      case "event":
        navigate("/events");
        break;
      case "listing":
        navigate("/marketplace");
        break;
      case "study_buddy":
        navigate("/study-buddy");
        break;
      case "alumni":
        navigate("/alumni");
        break;
      case "lost_found":
        navigate("/lost-found");
        break;
      case "tutorial":
        navigate("/tutorials");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background noise">
      <DashboardNavbar college={college} onCollegeChange={handleCollegeChange} />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-stranger text-4xl md:text-5xl text-foreground mb-4">
              Saved <span className="text-primary text-glow-subtle">Items</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Quick access to your bookmarked notes, events, listings, study buddies, and alumni.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : saved.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">You haven't saved anything yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {saved.map((row) => {
                const item = items[row.item_id];
                return (
                  <Card key={row.id} className="glass-dark border-border/30 hover-glow transition-all duration-300 group">
                    <CardHeader>
                      <CardTitle className="text-foreground font-serif text-lg line-clamp-2">
                        {getTitle(row, item)}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground capitalize">
                        {row.item_type.replace("_", " ")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {getDescription(item) && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {getDescription(item)}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        className="w-full border-border/50 hover:bg-primary/10 hover:border-primary/50"
                        onClick={() => goToItem(row)}
                      >
                        Open Section
                      </Button>
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

export default Saved;


