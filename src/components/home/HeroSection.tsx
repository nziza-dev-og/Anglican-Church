import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-primary/80 to-secondary/60 text-primary-foreground py-20 md:py-32 rounded-lg shadow-xl overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://placehold.co/1200x600.png"
          alt="Church congregation"
          layout="fill"
          objectFit="cover"
          className="opacity-30"
          data-ai-hint="church community"
        />
         <div className="absolute inset-0 bg-black/30"></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-fade-in">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold tracking-tight">
          Welcome to Rubavu Anglican Connect
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-primary-foreground/90 font-body animate-slide-in-up animation-delay-200">
          Connecting our community through faith, fellowship, and service. Discover upcoming events, resources, and ways to get involved.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 animate-slide-in-up animation-delay-400">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground btn-animated shadow-md">
            <Link href="/events">Upcoming Events</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-primary-foreground border-primary-foreground/50 hover:bg-primary-foreground/10 btn-animated shadow-md">
            <Link href="/about">Learn More About Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}