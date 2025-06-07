
"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="relative bg-gradient-to-r from-primary/80 to-secondary/60 text-primary-foreground py-20 md:py-32 rounded-lg shadow-xl overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://placehold.co/1200x600.png"
          alt={t('appName')} // Using appName as a general alt text for background
          layout="fill"
          objectFit="cover"
          className="opacity-30"
          data-ai-hint="church community"
        />
         <div className="absolute inset-0 bg-black/30"></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-fade-in">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold tracking-tight">
          {t('home.hero.title')}
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-primary-foreground/90 font-body animate-slide-in-up animation-delay-200">
          {t('home.hero.subtitle')}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 animate-slide-in-up animation-delay-400">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground btn-animated shadow-md">
            <Link href="/events">{t('home.hero.button.events')}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-primary-foreground border-primary-foreground/50 hover:bg-primary-foreground/10 btn-animated shadow-md">
            <Link href="/about">{t('home.hero.button.about')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
