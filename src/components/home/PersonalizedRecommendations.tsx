
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { personalizedContentRecommendations } from '@/ai/flows/personalized-content-recommendations';
import type { Recommendation } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ThumbsUp, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function PersonalizedRecommendations() {
  const { userProfile } = useAuth();
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
          // User interests might need translation if they are stored as keys
          // For now, assuming userInterests are stored in a common language or handled by Genkit
          const result = await personalizedContentRecommendations({
            userRole: userProfile.role, // Role might need to be mapped if stored as key
            userInterests: userProfile.interests?.join(', ') || 'General Church Activities',
          });
          setRecommendations(result.recommendations);
        } catch (err) {
          console.error("Error fetching recommendations:", err);
          setError(t('home.recommendations.error'));
        } finally {
          setLoading(false);
        }
      };
      fetchRecommendations();
    } else {
      setLoading(false); 
    }
  }, [userProfile, t]);

  if (!userProfile || (!loading && recommendations.length === 0 && !error)) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-headline font-semibold text-center mb-2 text-primary">
          {t('home.recommendations.title')}
        </h2>
        <p className="text-center text-muted-foreground mb-10">
          {t('home.recommendations.subtitle')}
        </p>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <p className="text-center text-destructive py-8">{error}</p>
        )}

        {!loading && !error && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((rec, index) => (
              <Card key={index} className="flex flex-col overflow-hidden shadow-lg rounded-lg card-animated bg-card animate-slide-in-up" style={{animationDelay: `${index * 100}ms`}}>
                <CardHeader>
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <ThumbsUp className="h-5 w-5" />
                    {/* Recommendation title and description are dynamic from Genkit, not translated here */}
                    <CardTitle className="font-headline text-xl text-primary">{rec.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-foreground/80 line-clamp-3">{rec.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="default" size="sm" className="w-full btn-animated">
                    <Link href={rec.link}>
                      {t('home.recommendations.button.checkItOut')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
