import { FileText, Calendar, Users, Building2, TrendingUp, MessageSquare } from "lucide-react";

const stats = [
  { icon: FileText, value: "2,500+", label: "Notes Shared", color: "text-primary" },
  { icon: Calendar, value: "150+", label: "Events Listed", color: "text-accent" },
  { icon: Users, value: "5,000+", label: "Active Students", color: "text-primary" },
  { icon: Building2, value: "25+", label: "Colleges", color: "text-accent" },
  { icon: TrendingUp, value: "95%", label: "Issues Resolved", color: "text-primary" },
  { icon: MessageSquare, value: "1,200+", label: "Study Groups", color: "text-accent" },
];

const StatsSection = () => {
  return (
    <section className="relative py-16 overflow-hidden border-y border-border/30">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
      
      <div className="relative container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-secondary/50 border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className={`font-stranger text-2xl md:text-3xl ${stat.color} text-glow-subtle`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
