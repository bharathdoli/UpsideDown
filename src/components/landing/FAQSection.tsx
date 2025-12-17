import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is it completely free to use?",
    answer: "Yes! The Campus Upside Down is 100% free for students. We believe in making college life easier without any financial barriers. Our platform is sustained by contributions and partnerships.",
  },
  {
    question: "How do I know the notes are reliable?",
    answer: "All notes are uploaded by verified students from each college. We have a rating and review system, so you can see what other students think. Highly-rated notes get featured to help you find the best resources.",
  },
  {
    question: "Can I upload my own notes and materials?",
    answer: "Absolutely! We encourage it. Sharing is caring. Upload your notes, past papers, or any study material and help your juniors. Top contributors get special recognition on our platform.",
  },
  {
    question: "Is my college data separate from others?",
    answer: "Yes, each college has its own isolated space. Your notes, events, and marketplace listings are only visible to students from your college. Your data never mixes with other campuses.",
  },
  {
    question: "How do I report a campus issue?",
    answer: "Simply go to the Issue Reporter section, fill in the details, upload photos if needed, and submit. Your issue gets tracked with a status (Reported → In Progress → Resolved). Anonymous reporting is also available.",
  },
  {
    question: "Can alumni still access the platform?",
    answer: "Yes! Alumni can stay connected through Alumni Connect. Share your experiences, guide current students, and give back to your college community. Once a portal member, always a member.",
  },
];

const FAQSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-stranger text-sm tracking-wider">FAQ</span>
          <h2 className="font-stranger text-3xl md:text-5xl text-foreground mt-2 mb-4">
            Questions? <span className="text-primary text-glow-subtle">We've Got Answers</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know before diving into The Upside Down.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="glass-dark border border-border/30 rounded-lg px-6 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-foreground font-stranger text-left hover:text-primary hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
