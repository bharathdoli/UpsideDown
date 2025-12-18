import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, BookOpen, Calendar, ChevronDown, AlertTriangle, ShoppingBag, GraduationCap, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggle from "./ThemeToggle";
import { getCollegeKey, prettifyCollegeName } from "@/lib/college";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableColleges, setAvailableColleges] = useState<string[]>([]);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center group-hover:animate-pulse-glow transition-all">
              <span className="text-primary font-stranger text-sm">TU</span>
            </div>
            <span className="font-stranger text-lg text-foreground flicker hidden sm:block">
              The Upside Down
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/notes"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Notes</span>
            </Link>
            <Link
              to="/events"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Events</span>
            </Link>
            <Link
              to="/issues"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Issues</span>
            </Link>
            <Link
              to="/marketplace"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Market</span>
            </Link>
            <Link
              to="/alumni"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Alumni</span>
            </Link>
            <Link
              to="/study-buddy"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              <Users className="w-4 h-4" />
              <span>Study</span>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  Colleges
                  <ChevronDown className="ml-1 w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-dark border-border/50 max-h-64 overflow-y-auto">
                {availableColleges.length === 0 && (
                  <DropdownMenuItem className="text-xs text-muted-foreground">
                    No colleges yet — create an account and add your college.
                  </DropdownMenuItem>
                )}
                {availableColleges.map((c) => (
                  <DropdownMenuItem key={c} className="hover:bg-primary/10 cursor-pointer">
                    {c}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Auth Buttons & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-muted-foreground text-sm">
                  {user.email?.split('@')[0]}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground box-glow">
                    Join Now
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="text-foreground p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-dark border-t border-border/30 animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link
              to="/notes"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary py-2"
              onClick={() => setIsOpen(false)}
            >
              <BookOpen className="w-4 h-4" />
              <span>Notes</span>
            </Link>
            <Link
              to="/events"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary py-2"
              onClick={() => setIsOpen(false)}
            >
              <Calendar className="w-4 h-4" />
              <span>Events</span>
            </Link>
            <Link
              to="/issues"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary py-2"
              onClick={() => setIsOpen(false)}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Issue Reporter</span>
            </Link>
            <Link
              to="/marketplace"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary py-2"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Marketplace</span>
            </Link>
            <Link
              to="/alumni"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary py-2"
              onClick={() => setIsOpen(false)}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Alumni Connect</span>
            </Link>
            <Link
              to="/study-buddy"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary py-2"
              onClick={() => setIsOpen(false)}
            >
              <Users className="w-4 h-4" />
              <span>Study Buddy</span>
            </Link>
            <div className="pt-4 border-t border-border/30 space-y-2">
              {user ? (
                <>
                  <p className="text-muted-foreground text-sm py-2">
                    Signed in as {user.email?.split('@')[0]}
                  </p>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Join Now
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
