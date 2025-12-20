import { useState, useEffect } from "react";
import { Trophy, Award, Medal, Star } from "lucide-react";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLeaderboard, getPoints, getBadges } from "@/lib/gamification";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  points_total: number;
  profiles: {
    full_name: string | null;
  } | null;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myPoints, setMyPoints] = useState(0);
  const [myBadges, setMyBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboard();
    if (user) {
      fetchMyStats();
    }
  }, [user]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const data = await getLeaderboard(20);
    setLeaderboard(data as any);
    setLoading(false);
  };

  const fetchMyStats = async () => {
    if (!user) return;
    const points = await getPoints(user.id);
    const badges = await getBadges(user.id);
    setMyPoints(points);
    setMyBadges(badges);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <Star className="w-6 h-6 text-muted-foreground" />;
  };

  const badgeNames: Record<string, string> = {
    top_contributor: "Top Contributor",
    active_member: "Active Member",
    contributor: "Contributor",
    note_master: "Note Master",
    event_organizer: "Event Organizer",
    mentor: "Mentor",
  };

  return (
    <div className="min-h-screen bg-background noise">
      <DashboardNavbar />
      <main className="pt-20 sm:pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-stranger text-4xl md:text-5xl text-foreground mb-4">
              <Trophy className="w-12 h-12 inline-block text-yellow-500 mr-2" />
              Leaderboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Top contributors and achievers
            </p>
          </div>

          {/* My Stats */}
          {user && (
            <Card className="glass-dark border-border/30 mb-8">
              <CardHeader>
                <CardTitle>My Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">{myPoints}</p>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{myBadges.length}</p>
                    <p className="text-sm text-muted-foreground">Badges Earned</p>
                  </div>
                </div>
                {myBadges.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {myBadges.map((badge) => (
                      <Badge key={badge.badge_key} className="bg-primary">
                        <Award className="w-3 h-3 mr-1" />
                        {badgeNames[badge.badge_key] || badge.badge_key}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="glass-dark border-border/30">
              <CardHeader>
                <CardTitle>Top Contributors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        index < 3 ? "bg-primary/10" : "bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(index)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {entry.profiles?.full_name || `User ${entry.user_id.slice(0, 8)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.points_total} points
                        </p>
                      </div>
                      <Badge variant="outline" className="text-lg font-bold">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;

