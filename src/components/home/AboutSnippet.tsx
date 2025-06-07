
import { Button } from "@/components/ui/button";
import { Church, Users, Target } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AboutSnippet() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="animate-fade-in">
            <h2 className="text-3xl font-headline font-semibold text-primary mb-4">
              About Rubavu Anglican Church
            </h2>
            <p className="text-lg text-foreground/80 mb-6">
              The Anglican Church in Rubavu is a vibrant community dedicated to spiritual growth, fellowship, and serving our neighbours. We strive to be a beacon of hope and love in Rubavu.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Church className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Our Mission</h3>
                  <p className="text-muted-foreground text-sm">To share the Gospel, nurture believers, and impact our community positively.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Our Vision</h3>
                  <p className="text-muted-foreground text-sm">A Christ-centered community transforming lives in Rubavu and beyond.</p>
                </div>
              </div>
            </div>
            <Button asChild size="lg" className="btn-animated">
              <Link href="/about">Discover More</Link>
            </Button>
          </div>
          <div className="relative h-80 md:h-96 rounded-lg overflow-hidden shadow-xl animate-fade-in animation-delay-200">
            <Image
              src="https://placehold.co/600x400.png"
              alt="Church Building or Community"
              layout="fill"
              objectFit="cover"
              className="transform transition-transform duration-500 hover:scale-105"
              data-ai-hint="church community"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
