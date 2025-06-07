
"use client";
import AppLayout from "@/components/layout/AppLayout";
import PageTitle from "@/components/shared/PageTitle";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Eye, HeartHandshake, ShieldCheck, UserCheck } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { USERS_COLLECTION, USER_ROLES } from "@/lib/constants";
import type { UserProfile } from "@/types";

export default function AboutPage() {
  const { t } = useTranslation();
  const [leadershipTeam, setLeadershipTeam] = useState<UserProfile[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);

  const coreValues = [
    { icon: <Users className="h-8 w-8 text-accent" />, titleKey: "about.coreValues.community.title", descriptionKey: "about.coreValues.community.description" },
    { icon: <Eye className="h-8 w-8 text-accent" />, titleKey: "about.coreValues.worship.title", descriptionKey: "about.coreValues.worship.description" },
    { icon: <HeartHandshake className="h-8 w-8 text-accent" />, titleKey: "about.coreValues.service.title", descriptionKey: "about.coreValues.service.description" },
    { icon: <ShieldCheck className="h-8 w-8 text-accent" />, titleKey: "about.coreValues.discipleship.title", descriptionKey: "about.coreValues.discipleship.description" },
  ];

  useEffect(() => {
    const fetchLeadership = async () => {
      setLoadingLeaders(true);
      try {
        const leadershipRoles = [USER_ROLES.CHIEF_PASTOR, USER_ROLES.PASTOR, USER_ROLES.DIACON];
        const usersQuery = query(collection(db, USERS_COLLECTION), where("role", "in", leadershipRoles));
        const querySnapshot = await getDocs(usersQuery);
        const fetchedLeaders: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          fetchedLeaders.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });
        // Sort by a predefined order if necessary, e.g., Chief Pastor first
        fetchedLeaders.sort((a, b) => {
            const roleOrder = { [USER_ROLES.CHIEF_PASTOR]: 1, [USER_ROLES.PASTOR]: 2, [USER_ROLES.DIACON]: 3 };
            return (roleOrder[a.role as keyof typeof roleOrder] || 99) - (roleOrder[b.role as keyof typeof roleOrder] || 99);
        });
        setLeadershipTeam(fetchedLeaders);
      } catch (error) {
        console.error("Error fetching leadership team:", error);
      } finally {
        setLoadingLeaders(false);
      }
    };
    fetchLeadership();
  }, []);


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
              src="https://i.pinimg.com/736x/74/ef/e4/74efe4d77ca70833ffdb4cbb5d1dbe8f.jpg"
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
           {loadingLeaders ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden card-animated">
                  <Skeleton className="h-60 w-full" />
                  <CardContent className="p-4 text-center">
                    <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : leadershipTeam.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <UserCheck className="mx-auto h-12 w-12 mb-3" />
              <p>{t('about.leadership.empty')}</p> 
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {leadershipTeam.map(leader => (
                <Card key={leader.uid} className="overflow-hidden card-animated">
                  <div className="relative h-60 w-full">
                      <Image 
                        src={leader.photoURL || `https://placehold.co/300x300.png?text=${leader.displayName?.charAt(0) || 'L'}`} 
                        alt={leader.displayName || 'Church Leader'} 
                        layout="fill" 
                        objectFit="cover" 
                        data-ai-hint="leader portrait"
                      />
                    </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="text-lg font-semibold text-primary">{leader.displayName}</h3>
                    <p className="text-sm text-muted-foreground">{t(`userRoles.${leader.role.toLowerCase().replace(/\s+/g, '')}`)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
