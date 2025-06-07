
"use client";
import AppLayout from "@/components/layout/AppLayout";
import PageTitle from "@/components/shared/PageTitle";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, HeartHandshake, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function AboutPage() {
  const { t } = useTranslation();

  const coreValues = [
    { icon: <Users className="h-8 w-8 text-accent" />, titleKey: "about.coreValues.community.title", descriptionKey: "about.coreValues.community.description" },
    { icon: <Eye className="h-8 w-8 text-accent" />, titleKey: "about.coreValues.worship.title", descriptionKey: "about.coreValues.worship.description" },
    { icon: <HeartHandshake className="h-8 w-8 text-accent" />, titleKey: "about.coreValues.service.title", descriptionKey: "about.coreValues.service.description" },
    { icon: <ShieldCheck className="h-8 w-8 text-accent" />, titleKey: "about.coreValues.discipleship.title", descriptionKey: "about.coreValues.discipleship.description" },
  ];

  const leadershipTeam = [
    { name: "Rev. [Name]", role: "Chief Pastor", image: "https://placehold.co/300x300.png", dataAiHint:"pastor portrait" },
    { name: "Pastor [Name]", role: "Associate Pastor", image: "https://placehold.co/300x300.png", dataAiHint:"pastor portrait" },
    { name: "[Name]", role: "Head Diacon", image: "https://placehold.co/300x300.png", dataAiHint:"church leader" },
  ];


  return (
    <AppLayout>
      <PageTitle
        title={t('about.title')}
        subtitle={t('about.subtitle')}
      />

      <div className="space-y-12">
        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-headline font-semibold text-primary mb-4">{t('about.history.title')}</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t('about.history.paragraph1')}
            </p>
            <p className="text-foreground/80 leading-relaxed">
              {t('about.history.paragraph2')}
            </p>
          </div>
          <div className="relative h-80 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="https://placehold.co/600x400.png"
              alt={t('about.history.title')}
              layout="fill"
              objectFit="cover"
              data-ai-hint="church history"
            />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-semibold text-primary mb-6 text-center">{t('about.coreValues.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map(value => (
              <Card key={value.titleKey} className="text-center card-animated p-2">
                <CardHeader className="items-center pb-2">
                  {value.icon}
                  <CardTitle className="mt-2 font-body text-lg">{t(value.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t(value.descriptionKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center bg-secondary/30 p-8 rounded-lg">
          <h2 className="text-2xl font-headline font-semibold text-primary mb-4">{t('about.missionVision.title')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('about.mission.title')}</h3>
              <p className="text-foreground/80 leading-relaxed">
                {t('about.mission.description')}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('about.vision.title')}</h3>
              <p className="text-foreground/80 leading-relaxed">
                {t('about.vision.description')}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-semibold text-primary mb-4">{t('about.leadership.title')}</h2>
          <p className="text-foreground/80 leading-relaxed mb-6">
            {t('about.leadership.description')}
          </p>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadershipTeam.map(leader => (
              <Card key={leader.name} className="overflow-hidden card-animated">
                 <div className="relative h-60 w-full">
                    <Image src={leader.image} alt={leader.name} layout="fill" objectFit="cover" data-ai-hint={leader.dataAiHint} />
                  </div>
                <CardContent className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-primary">{leader.name}</h3>
                  <p className="text-sm text-muted-foreground">{leader.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
