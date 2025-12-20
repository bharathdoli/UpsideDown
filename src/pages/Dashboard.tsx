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
  ArrowRight,
  Search,
  Youtube,
  MessageSquare,
  TrendingUp,
  FileText,
  Star
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
  {
    icon: Search,
    title: "Lost & Found",
    description: "Report lost items or claim found items on campus",
    path: "/lost-found",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Youtube,
    title: "Tutorials",
    description: "Browse and share YouTube tutorials for your subjects",
    path: "/tutorials",
    color: "from-rose-500 to-red-500",
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
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [activeRequests, setActiveRequests] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [myNotesCount, setMyNotesCount] = useState(0);
  const [myEventsCount, setMyEventsCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // Set loading to false immediately to show page, then fetch data in background
    setLoading(false);
    void fetchInitialData();
  }, [user, navigate]);

  const fetchInitialData = async () => {
    if (!user) return;

    // Fetch current user's college first (most important)
    const { data: profile } = await supabase
      .from("profiles")
      .select("college, branch, full_name")
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

    // Fetch User Points and Badges
    const { data: pointsData } = await supabase
      .from("user_points")
      .select("points_total")
      .eq("user_id", user.id)
      .single();
    setUserPoints(pointsData?.points_total || 0);

    const { data: badgesData } = await supabase
      .from("user_badges")
      .select("badge_key, awarded_at")
      .eq("user_id", user.id)
      .order("awarded_at", { ascending: false });
    setUserBadges(badgesData || []);

    // Fetch Saved Items Count
    const { count: savedCountData } = await supabase
      .from("saved_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setSavedCount(savedCountData || 0);

    // Fetch My Notes Count
    const { count: notesCount } = await supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setMyNotesCount(notesCount || 0);

    // Fetch My Events Count
    const { count: eventsCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setMyEventsCount(eventsCount || 0);

    // Fetch Widget Data
    // 1. Recent Marketplace Listings
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
      .select("id, title, event_date, location")
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(3);
    setUpcomingEvents(events || []);

    // 3. Active Study Requests Count
    const { count } = await supabase
      .from("study_buddy_requests")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);
    setActiveRequests(count || 0);

    // 4. Recent Activity (last 5 actions)
    const activities = [];
    
    // Recent notes
    const { data: recentNotes } = await supabase
      .from("notes")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(2);
    recentNotes?.forEach(note => {
      activities.push({ type: "note", title: note.title, date: note.created_at, id: note.id });
    });

    // Recent events
    const { data: recentEvents } = await supabase
      .from("events")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(2);
    recentEvents?.forEach(event => {
      activities.push({ type: "event", title: event.title, date: event.created_at, id: event.id });
    });

    // Sort by date and take latest 5
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentActivity(activities.slice(0, 5));

    // 5. My Study Groups
    const { data: myGroups } = await supabase
      .from("study_group_members")
      .select(`
        group_id,
        group:study_groups(id, subject, description)
      `)
      .eq("user_id", user.id)
      .limit(3);

    // 6. My Listings
    const { data: myListings } = await supabase
      .from("marketplace_listings")
      .select("id, title, price, image_url, is_sold")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

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

  // Don't block rendering - show page immediately
  if (!user) {
    return null;
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
      <main className="pt-20 sm:pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <section className="relative mb-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-3xl" />
            <div className="relative glass-dark border border-primary/20 rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4 flex-1">
                  {fullName && (
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">
                      Welcome back
                    </p>
                  )}
                  <h1 className="font-stranger text-4xl md:text-6xl text-foreground">
                    {fullName ? (
                      <>
                        Hey, <span className="text-primary text-glow">{fullName.split(" ")[0]}</span>!
                      </>
                    ) : (
                      <>
                        Campus <span className="text-primary text-glow">Dashboard</span>
                      </>
                    )}
                  </h1>
                  {college && branch && (
                    <p className="text-muted-foreground text-lg">
                      Studying <span className="text-foreground font-semibold">{branch}</span> at{" "}
                      <span className="text-primary font-semibold">{college}</span>
                    </p>
                  )}
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 w-full">
                  <Card className="glass-dark border-border/30 p-4 text-center hover:border-primary/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-2">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{userPoints}</p>
                    <p className="text-xs text-muted-foreground mt-1">Points</p>
                  </Card>
                  <Card className="glass-dark border-border/30 p-4 text-center hover:border-primary/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{myNotesCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Notes</p>
                  </Card>
                  <Card className="glass-dark border-border/30 p-4 text-center hover:border-primary/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                      <Star className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{savedCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Saved</p>
                  </Card>
                  <Card className="glass-dark border-border/30 p-4 text-center hover:border-primary/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-6 h-6 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{myEventsCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Events</p>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-stranger text-2xl md:text-3xl text-foreground">
                Quick <span className="text-primary">Actions</span>
              </h2>
              <Link to="/leaderboard">
                <Button variant="outline" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  Leaderboard
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              <Link to="/notes">
                <Card className="glass-dark border-border/30 hover-glow transition-all duration-300 cursor-pointer h-full text-center p-6 hover:border-primary/50">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-semibold text-foreground">Upload Notes</p>
                </Card>
              </Link>
              <Link to="/events">
                <Card className="glass-dark border-border/30 hover-glow transition-all duration-300 cursor-pointer h-full text-center p-6 hover:border-primary/50">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-semibold text-foreground">Create Event</p>
                </Card>
              </Link>
              <Link to="/marketplace">
                <Card className="glass-dark border-border/30 hover-glow transition-all duration-300 cursor-pointer h-full text-center p-6 hover:border-primary/50">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-semibold text-foreground">Sell Item</p>
                </Card>
              </Link>
              <Link to="/study-buddy">
                <Card className="glass-dark border-border/30 hover-glow transition-all duration-300 cursor-pointer h-full text-center p-6 hover:border-primary/50">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-semibold text-foreground">Find Buddy</p>
                </Card>
              </Link>
            </div>
          </section>

          {/* Features Section */}
          <section className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-stranger text-3xl md:text-4xl text-foreground mb-4">
                Explore <span className="text-primary text-glow-subtle">Features</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Everything you need to navigate campus life, all in one place.
              </p>
            </div>
          </section>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
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
              {/* Badges Widget */}
              {userBadges.length > 0 && (
                <Card className="glass-dark border-border/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      Your Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {userBadges.slice(0, 6).map((badge, idx) => (
                        <Badge key={idx} variant="outline" className="bg-primary/10 border-primary/30">
                          {badge.badge_key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              {recentActivity.length > 0 && (
                <Card className="glass-dark border-border/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === "note" ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500"
                        }`}>
                          {activity.type === "note" ? <FileText className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground truncate">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

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
              </Card>
            </div>
          </div>

          {/* Trending Section */}
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-stranger text-2xl md:text-3xl text-foreground">
                Trending <span className="text-primary">Now</span>
              </h2>
              <Button variant="ghost" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Trending Notes */}
              <Card className="glass-dark border-border/30 hover-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Popular Notes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Check out the most liked and downloaded notes from your college.
                  </p>
                  <Link to="/notes">
                    <Button variant="outline" className="w-full mt-4 gap-2">
                      Browse Notes
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Trending Events */}
              <Card className="glass-dark border-border/30 hover-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <CardTitle className="text-lg">Upcoming Events</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Don't miss out on exciting campus events and hackathons.
                  </p>
                  <Link to="/events">
                    <Button variant="outline" className="w-full mt-4 gap-2">
                      View Events
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Study Groups */}
              <Card className="glass-dark border-border/30 hover-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    <CardTitle className="text-lg">Active Groups</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Join study groups and collaborate with peers across colleges.
                  </p>
                  <Link to="/study-buddy">
                    <Button variant="outline" className="w-full mt-4 gap-2">
                      Find Groups
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
