import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, ChevronDown, ArrowLeft, Bell, Bookmark, MessageCircle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ThemeToggle from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { getCollegeKey, prettifyCollegeName } from "@/lib/college";

interface DashboardNavbarProps {
  college: string | null;
  onCollegeChange: (college: string) => void;
}

const DashboardNavbar = ({ college, onCollegeChange }: DashboardNavbarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [availableColleges, setAvailableColleges] = useState<string[]>([]);
  const [userCollege, setUserCollege] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user's college from profile (set during signup, cannot be changed)
    const fetchUserCollege = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("college")
        .eq("user_id", user.id)
        .single();
      if (data?.college) {
        setUserCollege(data.college);
      }
    };
    fetchUserCollege();

    const fetchColleges = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("college")
        .not("college", "is", null);

      if (error) {
        console.error("Error fetching colleges for navbar:", error);
        return;
      }

      const byKey = new Map<string, string>();

      data?.forEach((row) => {
        const raw = row.college as string | null;
        if (!raw) return;
        const pretty = prettifyCollegeName(raw);
        if (!pretty) return;
        const key = getCollegeKey(pretty);
        if (!key) return;
        if (!byKey.has(key)) {
          byKey.set(key, pretty);
        }
      });

      const list = Array.from(byKey.values()).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      );

      setAvailableColleges(list);
    };

    fetchColleges();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCollegeChange = (newCollege: string) => {
    // College dropdown is ONLY for viewing/filtering content
    // It does NOT change the user's college in their profile
    // The user's college from signup is FINAL and cannot be changed
    onCollegeChange(newCollege);
    if (newCollege === "All Colleges") {
      toast({ title: "Viewing all colleges", description: "Now showing content from all colleges" });
    } else {
      toast({ title: `Viewing ${newCollege}`, description: "Filtering content by college" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Back to Dashboard */}
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:block">Dashboard</span>
            </Link>

            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center group-hover:animate-pulse-glow transition-all">
                <span className="text-primary font-stranger text-sm">TU</span>
              </div>
              <span className="font-stranger text-lg text-foreground flicker hidden md:block">
                The Upside Down
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* College Selector - ONLY for viewing/filtering content */}
            {/* User's college from signup is FINAL and cannot be changed */}
            <div className="flex items-center gap-1 md:gap-2">
              {userCollege && (
                <span className="text-xs text-muted-foreground whitespace-nowrap hidden lg:inline">
                  Your College: <span className="text-primary font-semibold">{userCollege}</span>
                </span>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-border/50 text-xs md:text-sm px-2 md:px-3">
                    <span className="hidden sm:inline">View: </span>
                    <span className="max-w-[100px] md:max-w-none truncate">{college || "All"}</span>
                    <ChevronDown className="ml-1 md:ml-2 w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-dark border-border/50">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground border-b border-border/30">
                    Filter by college (viewing only)
                  </div>
                  <DropdownMenuItem
                    onClick={() => handleCollegeChange("All Colleges")}
                    className="hover:bg-primary/10 cursor-pointer font-semibold"
                  >
                    All Colleges
                  </DropdownMenuItem>
                  {availableColleges.length === 0 && (
                    <DropdownMenuItem className="text-xs text-muted-foreground">
                      No specific colleges yet — sign up to add one.
                    </DropdownMenuItem>
                  )}
                  {availableColleges.map((c) => (
                    <DropdownMenuItem
                      key={c}
                      onClick={() => handleCollegeChange(c)}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      {c}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <NotificationBell />
            <Link
              to="/saved"
              className="hidden lg:inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Bookmark className="w-4 h-4 mr-1" />
              <span className="hidden xl:inline">Saved</span>
            </Link>
            <Link
              to="/messages"
              className="hidden lg:inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="hidden xl:inline">Messages</span>
            </Link>
            <Link
              to="/leaderboard"
              className="hidden lg:inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Trophy className="w-4 h-4 mr-1" />
              <span className="hidden xl:inline">Leaderboard</span>
            </Link>
            <ThemeToggle />

            <span className="text-muted-foreground text-xs md:text-sm hidden lg:block max-w-[80px] truncate">
              {user?.email?.split("@")[0]}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
