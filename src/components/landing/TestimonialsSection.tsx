import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Priya Sharma",
    college: "IIT Delhi",
    year: "3rd Year, CSE",
    image: "PS",
    quote: "Found all my semester notes in one place. No more begging seniors on WhatsApp!",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    college: "NIT Trichy",
    year: "2nd Year, ECE",
    image: "RV",
    quote: "Sold my old books in a day and found a study buddy for gate prep. This is exactly what we needed.",
    rating: 5,
  },
  {
    name: "Ananya Patel",
    college: "BITS Pilani",
    year: "4th Year, Mechanical",
    image: "AP",
    quote: "The placement experiences section helped me crack my interviews. Forever grateful!",
    rating: 5,
  },
  {
    name: "Karthik Reddy",
    college: "VIT Vellore",
    year: "2nd Year, IT",
    image: "KR",
    quote: "Finally reported the broken AC in our hostel and it actually got fixed. Magic!",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 portal-bg opacity-30" />
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-stranger text-sm tracking-wider">TESTIMONIALS</span>
          <h2 className="font-stranger text-3xl md:text-5xl text-foreground mt-2 mb-4">
            Students Love <span className="text-primary text-glow-subtle">The Upside Down</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Don't take our word for it. Here's what your fellow students are saying.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name}
              className="glass-dark border-border/30 hover-glow transition-all duration-300 group overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                
                {/* Quote */}
                <p className="text-foreground text-lg mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <span className="font-stranger text-primary text-sm">{testimonial.image}</span>
                  </div>
                  <div>
                    <p className="font-stranger text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.year} • {testimonial.college}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
