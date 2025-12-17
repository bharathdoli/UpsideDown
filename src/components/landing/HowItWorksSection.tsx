import { UserPlus, Search, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Select Your College",
    description: "Choose your campus from our growing network. Your data stays within your college community.",
  },
  {
    icon: Search,
    step: "02",
    title: "Explore Everything",
    description: "Access notes, events, marketplace, and connect with seniors—all in one unified portal.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Contribute & Grow",
    description: "Share your knowledge, sell old books, report issues, and help build a stronger campus community.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-stranger text-sm tracking-wider">HOW IT WORKS</span>
          <h2 className="font-stranger text-3xl md:text-5xl text-foreground mt-2 mb-4">
            Three Steps to <span className="text-primary text-glow-subtle">Freedom</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            No complicated setup. No learning curve. Just college life, simplified.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="relative group"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="relative z-10 text-center p-6">
                {/* Step Number */}
                <div className="font-stranger text-6xl text-primary/20 absolute -top-2 left-1/2 -translate-x-1/2">
                  {item.step}
                </div>
                
                {/* Icon */}
                <div className="relative w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="font-stranger text-xl text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
