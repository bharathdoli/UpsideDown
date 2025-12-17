import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, 
  Calendar, 
  AlertTriangle, 
  ShoppingBag, 
  GraduationCap, 
  Users,
  LogOut,
  ChevronDown,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { toast } from "@/hooks/use-toast";

const features = [
  {
    icon: BookOpen,
    title: "Notes & Papers",
    description: "Access study materials, notes, and past papers shared by your seniors",
    path: "/notes",
    color: "from-red-500 to-orange-500",
  },
  {
    icon: Calendar,
    title: "Events & Hackathons",
    description: "Never miss campus events, workshops, and hackathons",
    path: "/events",
    color: "from-orange-500 to-yellow-500",
  },
  {
    icon: AlertTriangle,
    title: "Issue Reporter",
    description: "Report campus issues and track their resolution status",
    path: "/issues",
    color: "from-yellow-500 to-green-500",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Buy, sell, or borrow items from fellow students",
    path: "/marketplace",
    color: "from-green-500 to-teal-500",
  },
  {
    icon: GraduationCap,
    title: "Alumni Connect",
    description: "Connect with alumni for guidance and opportunities",
    path: "/alumni",
    color: "from-teal-500 to-blue-500",
  },
  {
    icon: Users,
    title: "Study Buddy",
    description: "Find study partners or offer help in subjects you excel at",
    path: "/study-buddy",
    color: "from-blue-500 to-purple-500",
  },
];

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [college, setCollege] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchUserProfile();
  }, [user, navigate]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("college")
      .eq("user_id", user.id)
      .single();

    if (data?.college) {
      setCollege(data.college);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleCollegeChange = async (newCollege: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ college: newCollege })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error updating college", description: error.message, variant: "destructive" });
    } else {
      setCollege(newCollege);
      toast({ title: "College updated!", description: `Now viewing ${newCollege} content` });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background noise">
      {/* Background Effects */}
      <div className="fixed inset-0 upside-down-bg pointer-events-none" />
      <div className="fixed inset-0 portal-bg pointer-events-none" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center group-hover:animate-pulse-glow transition-all">
                <span className="text-primary font-stranger text-sm">TU</span>
              </div>
              <span className="font-stranger text-lg text-foreground flicker hidden sm:block">
                The Upside Down
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {/* College Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-border/50 text-sm">
                    {college || "Select College"}
                    <ChevronDown className="ml-2 w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-dark border-border/50">
                  {["Demo College", "IIT Delhi", "IIT Bombay", "NIT Trichy", "BITS Pilani"].map((c) => (
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

              <ThemeToggle />

              <span className="text-muted-foreground text-sm hidden md:block">
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

      {/* Main Content */}
      <main className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Welcome Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="font-stranger text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              Welcome to <span className="text-primary text-glow">The Portal</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              {college ? (
                <>Exploring content from <span className="text-primary font-semibold">{college}</span></>
              ) : (
                <>Select your college to see relevant content</>
              )}
            </p>
          </div>

          {/* College Selection Prompt */}
          {!college && (
            <div className="max-w-md mx-auto mb-12">
              <Card className="glass-dark border-primary/30 text-center">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">
                    Please select your college to access content specific to your campus.
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        Select Your College
                        <ChevronDown className="ml-2 w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass-dark border-border/50">
                      {["Demo College", "IIT Delhi", "IIT Bombay", "NIT Trichy", "BITS Pilani"].map((c) => (
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
                </CardContent>
              </Card>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link key={index} to={feature.path}>
                <Card className="glass-dark border-border/30 hover-glow transition-all duration-300 group h-full cursor-pointer overflow-hidden">
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="font-stranger text-xl text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
