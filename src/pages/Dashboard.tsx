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
  Settings,
  Trophy,
  Clock,
  Activity,
  ArrowRight
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
import { getCollegeKey, prettifyCollegeName } from "@/lib/college";
import { Badge } from "@/components/ui/badge";

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
  {
    icon: Users,
    title: "Saved Items",
    description: "All your bookmarked notes, events, listings, and more in one place",
    path: "/saved",
    color: "from-purple-500 to-pink-500",
  },
];

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [college, setCollege] = useState<string | null>(null);
  const [branch, setBranch] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [availableColleges, setAvailableColleges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // New State for Widgets
  const [userPoints, setUserPoints] = useState(0);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [activeRequests, setActiveRequests] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    void fetchInitialData();
  }, [user, navigate]);

  const fetchInitialData = async () => {
    if (!user) return;

    // Fetch current user's college
    const { data: profile } = await supabase
      .from("profiles")
      .select("college, branch, full_name, points")
      .eq("user_id", user.id)
      .single();

    if (profile?.college) {
      setCollege(profile.college);
    }
    if (profile?.branch) {
      setBranch(profile.branch);
    }
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
    if (profile?.points) {
      setUserPoints(profile.points);
    }

    // Fetch all colleges to populate dropdown, normalize to merge variants
    const { data: allProfiles, error } = await supabase
      .from("profiles")
      .select("college")
      .not("college", "is", null);

    if (error) {
      toast({
        title: "Could not load college list",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const byKey = new Map<string, string>();
    allProfiles?.forEach((row) => {
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

    // Fetch Widget Data
    // 1. Recent Marketplace Listings (Global or College specific)
    const { data: listings } = await supabase
      .from("marketplace_listings")
      .select("id, title, price, image_url, created_at")
      .eq("is_sold", false)
      .order("created_at", { ascending: false })
      .limit(3);
    setRecentListings(listings || []);

    // 2. Upcoming Events
    const { data: events } = await supabase
      .from("events")
      .select("id, title, date, location")
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true })
      .limit(3);
    setUpcomingEvents(events || []);

    // 3. Active Study Requests Count
    const { count } = await supabase
      .from("study_buddy_requests")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);
    setActiveRequests(count || 0);

    // 4. My Study Groups
    const { data: myGroups } = await supabase
      .from("study_group_members")
      .select(`
        group_id,
        group:study_groups(id, subject, description)
      `)
      .eq("user_id", user.id)
      .limit(3);

    // 5. My Listings
    const { data: myListings } = await supabase
      .from("marketplace_listings")
      .select("id, title, price, image_url, is_sold")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    setLoading(false);

    setMyGroups(myGroups?.map((g: any) => g.group) || []);
    setMyListings(myListings || []);
  };

  // Add new state variables
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleCollegeChange = (newCollege: string) => {
    // College dropdown is ONLY for viewing/filtering content
    // It does NOT change the user's college in their profile
    // The user's college from signup is FINAL and cannot be changed
    setCollege(newCollege);
    if (newCollege === "All Colleges") {
      toast({ title: "Viewing all colleges", description: "Now showing content from all colleges" });
    } else {
      toast({ title: `Viewing ${newCollege}`, description: "Filtering content by college" });
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
              {/* College Selector built from actual data, normalized */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-border/50 text-sm">
                    {college || "Select College"}
                    <ChevronDown className="ml-2 w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-dark border-border/50">
                  {availableColleges.length === 0 && (
                    <DropdownMenuItem className="text-muted-foreground text-xs">
                      No colleges yet – add yours in your profile.
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

              <ThemeToggle />

              <span className="text-muted-foreground text-sm hidden md:block">
                {fullName || user?.email?.split("@")[0]}
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
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div className="space-y-2">
              {fullName && (
                <p className="text-sm text-muted-foreground">
                  Welcome back, <span className="font-semibold text-foreground">{fullName}</span>
                </p>
              )}
              <h1 className="font-stranger text-4xl md:text-5xl text-foreground">
                Campus <span className="text-primary text-glow">Dashboard</span>
              </h1>
            </div>

            {/* Quick Stats Cards */}
            <div className="flex gap-4">
              <Card className="glass-dark border-border/30 p-3 flex items-center gap-3 min-w-[140px]">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Points</p>
                  <p className="text-lg font-bold text-foreground">{userPoints}</p>
                </div>
              </Card>
              <Card className="glass-dark border-border/30 p-3 flex items-center gap-3 min-w-[140px]">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Requests</p>
                  <p className="text-lg font-bold text-foreground">{activeRequests}</p>
                </div>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Features Grid */}
            <div className="lg:col-span-2 space-y-8">
              {!college && (
                <Card className="glass-dark border-primary/30 text-center mb-8">
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
                  </CardContent>
                </Card>
              )}

              <div className="grid md:grid-cols-2 gap-6">
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

            {/* Right Column: Widgets */}
            <div className="space-y-6">
              {/* My Study Groups */}
              <Card className="glass-dark border-border/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      My Groups
                    </CardTitle>
                    <Link to="/study-buddy" className="text-xs text-primary hover:underline">View All</Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {myGroups.length > 0 ? (
                    myGroups.map((group) => (
                      <Link key={group.id} to={`/group-chat/${group.id}`} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{group.subject}</p>
                          <p className="text-xs text-muted-foreground truncate">{group.description || "No description"}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">You haven't joined any groups yet</p>
                  )}
                </CardContent>
              </Card>

              {/* My Listings */}
              <Card className="glass-dark border-border/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-green-500" />
                      My Listings
                    </CardTitle>
                    <Link to="/marketplace" className="text-xs text-primary hover:underline">View All</Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {myListings.length > 0 ? (
                    myListings.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">₹{item.price}</p>
                            {item.is_sold && <Badge variant="secondary" className="text-[10px] h-4">Sold</Badge>}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No active listings</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Marketplace Items */}
              <Card className="glass-dark border-border/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-primary" />
                      Fresh Finds
                    </CardTitle >
                    <Link to="/marketplace" className="text-xs text-primary hover:underline">View All</Link>
                  </div >
                </CardHeader >
                <CardContent className="space-y-4">
                  {recentListings.length > 0 ? (
                    recentListings.map((item) => (
                      <Link key={item.id} to="/marketplace" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{item.title}</p>
                          <p className="text-xs text-muted-foreground">₹{item.price}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent listings</p>
                  )}
                </CardContent>
              </Card >

              {/* Upcoming Events */}
              < Card className="glass-dark border-border/30" >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      Upcoming Events
                    </CardTitle>
                    <Link to="/events" className="text-xs text-primary hover:underline">View All</Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <Link key={event.id} to="/events" className="flex items-start gap-3 group">
                        <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex flex-col items-center justify-center text-orange-500 border border-orange-500/20">
                          <span className="text-xs font-bold">{new Date(event.date).getDate()}</span>
                          <span className="text-[10px] uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{event.title}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
                  )}
                </CardContent>
              </Card >
            </div >
          </div >
        </div >
      </main >
    </div >
  );
};

export default Dashboard;
