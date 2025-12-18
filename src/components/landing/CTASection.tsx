import { ArrowRight, Sparkles, Zap, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const benefits = [
  { icon: Zap, text: "Instant Access" },
  { icon: Shield, text: "100% Free Forever" },
  { icon: Heart, text: "Student Community" },
];

const CTASection = () => {
  return (
    <section id="cta" className="relative py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 portal-bg opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center glass-dark rounded-2xl p-8 md:p-16 border border-primary/20 animate-pulse-glow relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-br-full" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-accent/20 to-transparent rounded-tl-full" />
          
          {/* Icon */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-8">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" style={{ animationDuration: '2s' }} />
          </div>
          
          {/* Title */}
          <h2 className="font-stranger text-3xl md:text-5xl text-foreground mb-4">
            Ready to Flip Your Campus <br className="hidden md:block" />
            <span className="text-primary text-glow">Right Side Up?</span>
          </h2>
          
          {/* Description */}
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Join the movement. Thousands of students are already using The Upside Down 
            to navigate college life smarter, not harder.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <benefit.icon className="w-4 h-4 text-primary" />
                <span className="text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>
          
          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-7 text-lg box-glow hover-glow group"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-muted-foreground mt-6">
            ⚡ <span className="text-primary">247 students</span> joined this week
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
