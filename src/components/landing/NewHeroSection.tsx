import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NewHeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full particle"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              background: i % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 5 + 5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 pt-20 text-center z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-dark border border-primary/30 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-sm text-muted-foreground">
              By students, for students • <span className="text-primary font-semibold">100% Free</span>
            </span>
          </div>

          {/* Main Title */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h1 className="font-stranger text-6xl md:text-8xl lg:text-9xl text-foreground tracking-tight">
              THE CAMPUS
            </h1>
            <div className="relative inline-block">
              <h1 className="font-stranger text-6xl md:text-8xl lg:text-9xl text-primary text-glow">
                UPSIDE DOWN
              </h1>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
          </div>

          {/* Subtitle */}
          <p 
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-in leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            Stop hunting. <span className="text-foreground font-medium">Start finding.</span>
            <br />
            Notes, events, marketplace, alumni — <span className="text-primary">one portal for everything.</span>
          </p>

          {/* Stats Row */}
          <div 
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16 py-8 animate-fade-in"
            style={{ animationDelay: "0.25s" }}
          >
            {[
              { value: "5K+", label: "Students" },
              { value: "25+", label: "Colleges" },
              { value: "10K+", label: "Notes Shared" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-stranger text-4xl md:text-5xl text-foreground">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div 
            className="pt-4 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-7 text-xl box-glow hover-glow group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2 font-stranger">
                  Enter The Portal
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>

          {/* Trust Badge */}
          <div 
            className="flex items-center justify-center gap-4 pt-8 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex -space-x-3">
              {["PK", "AV", "RJ", "SM", "NS"].map((initials, i) => (
                <div 
                  key={i}
                  className="w-10 h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center"
                  style={{ zIndex: 5 - i }}
                >
                  <span className="text-xs font-stranger text-muted-foreground">{initials}</span>
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Zap key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Trusted by students across India</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default NewHeroSection;
