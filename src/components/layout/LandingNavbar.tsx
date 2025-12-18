import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center group-hover:animate-pulse-glow transition-all">
              <span className="text-primary font-stranger text-sm">TU</span>
            </div>
            <span className="font-stranger text-lg text-foreground flicker hidden sm:block">
              The Upside Down
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              FAQs
            </button>
            <button
              onClick={() => scrollToSection("cta")}
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              Ready to Flip?
            </button>
          </div>

          {/* Auth Buttons & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground box-glow">
                Enter Portal
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="text-foreground p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-dark border-t border-border/30 animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <button
              onClick={() => scrollToSection("hero")}
              className="block w-full text-left text-muted-foreground hover:text-primary py-2"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="block w-full text-left text-muted-foreground hover:text-primary py-2"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="block w-full text-left text-muted-foreground hover:text-primary py-2"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="block w-full text-left text-muted-foreground hover:text-primary py-2"
            >
              FAQs
            </button>
            <button
              onClick={() => scrollToSection("cta")}
              className="block w-full text-left text-muted-foreground hover:text-primary py-2"
            >
              Ready to Flip?
            </button>
            <div className="pt-4 border-t border-border/30">
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Enter Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
