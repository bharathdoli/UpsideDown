import { Link } from "react-router-dom";
import { BookOpen, Calendar, Users, Megaphone, ShoppingBag, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Notes & Past Papers",
    description: "Access study materials, notes, and previous year papers shared by seniors. No more begging in WhatsApp groups.",
    path: "/auth",
  },
  {
    icon: Calendar,
    title: "Events Hub",
    description: "All college events, hackathons, fests, and workshops in one place. Never miss an opportunity again.",
    path: "/auth",
  },
  {
    icon: Users,
    title: "Senior Connect",
    description: "Get placement tips, interview experiences, and career advice from alumni who've been there.",
    path: "/auth",
  },
  {
    icon: Megaphone,
    title: "Issue Reporter",
    description: "Report hostel or campus issues with photos. Track status until resolved. Make your voice heard.",
    path: "/auth",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Buy, sell, or borrow books, lab coats, and more. Student-to-student, no middlemen.",
    path: "/auth",
  },
  {
    icon: Wrench,
    title: "Study Buddy",
    description: "Find classmates for projects, study groups, or exam prep. Learn together, grow together.",
    path: "/auth",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-stranger text-3xl md:text-5xl text-foreground mb-4">
            Your Campus, <span className="text-primary text-glow-subtle">Organized</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything scattered across a dozen apps, now in one place. 
            Built by students who got tired of the chaos.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link to={feature.path} key={feature.title}>
              <Card 
                className="glass-dark border-border/30 hover-glow transition-all duration-300 group cursor-pointer h-full hover:border-primary/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-foreground font-stranger text-xl mt-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
