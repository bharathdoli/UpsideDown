import { ArrowRight, Zap, Sparkles, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 upside-down-bg" />
      <div className="absolute inset-0 portal-bg" />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full particle"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: i % 2 === 0 ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--accent) / 0.5)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 5 + 5}s`,
            }}
          />
        ))}
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Scanline Effect */}
      <div className="absolute inset-0 scanline pointer-events-none" />
      
      {/* Content */}
      <div className="relative container mx-auto px-4 pt-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark border border-primary/30 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-sm text-muted-foreground">
              For students, by students • <span className="text-primary">100% Free</span>
            </span>
          </div>

          {/* Main Title */}
          <h1 
            className="font-stranger text-5xl md:text-7xl lg:text-8xl text-foreground flicker animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            THE CAMPUS
            <br />
            <span className="text-glow text-primary relative">
              UPSIDE DOWN
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            Stop hunting. Start finding. <span className="text-foreground">Notes, events, seniors' advice, 
            marketplace</span> — everything you need for college, in one portal.
          </p>

          {/* Feature Pills */}
          <div 
            className="flex flex-wrap items-center justify-center gap-3 animate-fade-in"
            style={{ animationDelay: "0.25s" }}
          >
            {[
              { icon: BookOpen, text: "Notes & Papers" },
              { icon: Users, text: "Alumni Connect" },
              { icon: Zap, text: "Quick Issue Reports" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-sm text-muted-foreground">
                <item.icon className="w-3.5 h-3.5 text-primary" />
                {item.text}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <Link to="/notes">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg box-glow hover-glow group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Enter The Portal
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button 
                variant="outline" 
                size="lg"
                className="border-border/50 hover:bg-secondary/50 hover:border-primary/50 px-8 py-6 text-lg group"
              >
                <span className="group-hover:text-primary transition-colors">How It Works</span>
              </Button>
            </a>
          </div>

          {/* Trust Indicators */}
          <div 
            className="flex items-center justify-center gap-8 pt-8 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex -space-x-3">
              {['PS', 'RV', 'AP', 'KR', '+'].map((initials, i) => (
                <div 
                  key={i}
                  className="w-10 h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center"
                >
                  <span className="text-xs font-stranger text-muted-foreground">{initials}</span>
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm text-foreground font-medium">Join 5,000+ students</p>
              <p className="text-xs text-muted-foreground">across 25+ colleges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
