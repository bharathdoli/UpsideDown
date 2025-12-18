import { Link } from "react-router-dom";
const colleges = [
  "IIT Delhi", "IIT Bombay", "NIT Trichy", "BITS Pilani", "VIT Vellore",
  "SRM Chennai", "Manipal", "IIIT Hyderabad", "DTU Delhi", "NIT Surathkal"
];

const CollegesSection = () => {
  return (
    <section className="relative py-16 overflow-hidden">
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-muted-foreground text-sm">
            TRUSTED BY STUDENTS FROM
          </p>
        </div>

        {/* Scrolling Colleges - Two Rows */}
        <div className="space-y-4 overflow-hidden">
          {/* First Row - Left to Right */}
          <div className="relative">
            <div className="flex animate-scroll-left gap-8">
              {[...colleges, ...colleges].map((college, index) => (
                <div
                  key={`row1-${index}`}
                  className="flex-shrink-0 px-6 py-3 rounded-full glass-dark border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors whitespace-nowrap"
                >
                  <span className="font-stranger text-sm">{college}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Second Row - Right to Left */}
          <div className="relative">
            <div className="flex animate-scroll-right gap-8">
              {[...colleges.reverse(), ...colleges].map((college, index) => (
                <div
                  key={`row2-${index}`}
                  className="flex-shrink-0 px-6 py-3 rounded-full glass-dark border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors whitespace-nowrap"
                >
                  <span className="font-stranger text-sm">{college}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Don't see your college? <Link to="/auth"><span className="text-primary hover:underline cursor-pointer">Request to add it →</span></Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default CollegesSection;
