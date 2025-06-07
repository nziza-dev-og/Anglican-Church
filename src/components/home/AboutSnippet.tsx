
"use client";
import { Button } from "@/components/ui/button";
import { Church, Users, Target } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function AboutSnippet() {
  const { t } = useTranslation();
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="animate-fade-in">
            <h2 className="text-3xl font-headline font-semibold text-primary mb-4">
              {t('home.aboutSnippet.title')}
            </h2>
            <p className="text-lg text-foreground/80 mb-6">
              {t('home.aboutSnippet.paragraph1')}
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Church className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">{t('home.aboutSnippet.mission.title')}</h3>
                  <p className="text-muted-foreground text-sm">{t('home.aboutSnippet.mission.description')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">{t('home.aboutSnippet.vision.title')}</h3>
                  <p className="text-muted-foreground text-sm">{t('home.aboutSnippet.vision.description')}</p>
                </div>
              </div>
            </div>
            <Button asChild size="lg" className="btn-animated">
              <Link href="/about">{t('home.aboutSnippet.discoverMore')}</Link>
            </Button>
          </div>
          <div className="relative h-80 md:h-96 rounded-lg overflow-hidden shadow-xl animate-fade-in animation-delay-200">
            <Image
              src="https://i.pinimg.com/736x/37/c7/59/37c759e8e8ca7ee48fd6e97a9b2fa26a.jpg"
              alt={t('home.aboutSnippet.title')}
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
