import { Link, useNavigate } from "react-router-dom";
import { Github, Twitter, Instagram } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Footer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFeatureClick = (path: string) => {
    if (user) {
      navigate(path);
    } else {
      navigate("/auth");
    }
  };

  return (
    <footer className="relative border-t border-border/30 py-12 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                <span className="text-primary font-stranger text-sm">TU</span>
              </div>
              <span className="font-stranger text-lg text-foreground">
                The Upside Down
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Making college life less chaotic, one feature at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-stranger text-foreground mb-4">Features</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleFeatureClick("/notes")} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Notes & Papers
                </button>
              </li>
              <li>
                <button onClick={() => handleFeatureClick("/events")} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Events Hub
                </button>
              </li>
              <li>
                <button onClick={() => handleFeatureClick("/issues")} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Issue Reporter
                </button>
              </li>
              <li>
                <button onClick={() => handleFeatureClick("/marketplace")} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => handleFeatureClick("/study-buddy")} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Study Buddy
                </button>
              </li>
              <li>
                <button onClick={() => handleFeatureClick("/alumni")} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Alumni Connect
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-stranger text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#hero" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#fad" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#cta" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Ready to Flip?
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-stranger text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} The Campus Upside Down. Built with ❤️ by students.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
