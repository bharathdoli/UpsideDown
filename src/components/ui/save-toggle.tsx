import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "./button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface SaveToggleProps {
  itemType: "note" | "event" | "listing" | "study_buddy" | "alumni" | "lost_found" | "tutorial";
  itemId: string;
  initialSaved?: boolean;
  className?: string;
}

export const SaveToggle = ({ itemType, itemId, initialSaved = false, className }: SaveToggleProps) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(initialSaved);

  useEffect(() => {
    const fetchInitial = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("saved_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .maybeSingle();

      if (error) {
        console.error("Error checking saved state", error);
        return;
      }
      if (data) {
        setSaved(true);
      }
    };

    fetchInitial();
  }, [user, itemType, itemId]);

  const handleToggle = async () => {
    if (!user) {
      toast({ title: "Please login to save items", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (saved) {
        const { error } = await supabase
          .from("saved_items")
          .delete()
          .eq("user_id", user.id)
          .eq("item_type", itemType)
          .eq("item_id", itemId);

        if (error) throw error;
        setSaved(false);
      } else {
        const { error } = await supabase.from("saved_items").insert({
          user_id: user.id,
          item_type: itemType,
          item_id: itemId,
        });

        if (error) throw error;
        setSaved(true);
      }
    } catch (error: any) {
      toast({ title: "Error updating saved item", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "outline"}
      size="icon"
      className={`${saved ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""} ${className ?? ""}`}
      disabled={saving}
      onClick={handleToggle}
      aria-label={saved ? "Unsave" : "Save"}
    >
      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
    </Button>
  );
};


