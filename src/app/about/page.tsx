
import AppLayout from "@/components/layout/AppLayout";
import PageTitle from "@/components/shared/PageTitle";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, HeartHandshake, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <AppLayout>
      <PageTitle
        title="About Us"
        subtitle="Learn more about the Anglican Church in Rubavu, our history, mission, and values."
      />

      <div className="space-y-12">
        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Our History</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              The Anglican Church in Rubavu has a rich history rooted in faith and community service. Established in [Year of Establishment, e.g., 1985], our church has grown from a small fellowship to a vibrant congregation. We have been a spiritual home for generations, witnessing God&apos;s faithfulness through various seasons. Our journey is one of perseverance, prayer, and a deep commitment to spreading the Gospel in Rubavu and beyond.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Over the years, we have expanded our ministries, built lasting relationships, and contributed to the well-being of our local area. We cherish our heritage and look forward to what God has in store for our future.
            </p>
          </div>
          <div className="relative h-80 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="https://placehold.co/600x400.png"
              alt="Historic photo of the church or founding members"
              layout="fill"
              objectFit="cover"
              data-ai-hint="church history"
            />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-semibold text-primary mb-6 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Users className="h-8 w-8 text-accent" />, title: "Community", description: "Fostering a welcoming and supportive family of believers." },
              { icon: <Eye className="h-8 w-8 text-accent" />, title: "Worship", description: "Gathering to honor God with heartfelt praise and reverence." },
              { icon: <HeartHandshake className="h-8 w-8 text-accent" />, title: "Service", description: "Extending God's love through compassionate action and outreach." },
              { icon: <ShieldCheck className="h-8 w-8 text-accent" />, title: "Discipleship", description: "Growing in faith and knowledge of Jesus Christ." },
            ].map(value => (
              <Card key={value.title} className="text-center card-animated p-2">
                <CardHeader className="items-center pb-2">
                  {value.icon}
                  <CardTitle className="mt-2 font-body text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center bg-secondary/30 p-8 rounded-lg">
          <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Our Mission & Vision</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Mission</h3>
              <p className="text-foreground/80 leading-relaxed">
                To make disciples of Jesus Christ by proclaiming the Gospel, nurturing believers in their faith journey, and serving our community with love and compassion, reflecting God&apos;s kingdom on earth.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Vision</h3>
              <p className="text-foreground/80 leading-relaxed">
                To be a transformative, Christ-centered community that shines as a beacon of hope, faith, and love in Rubavu, empowering individuals to live purposeful lives according to God&apos;s will.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Leadership</h2>
          <p className="text-foreground/80 leading-relaxed mb-6">
            Our church is led by a dedicated team of pastors, deacons, and lay leaders committed to serving the congregation and upholding our church&apos;s values.
            (More details about specific leaders can be added here or on a separate leadership page if needed).
          </p>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Rev. [Name]", role: "Chief Pastor", image: "https://placehold.co/300x300.png", dataAiHint:"pastor portrait" },
              { name: "Pastor [Name]", role: "Associate Pastor", image: "https://placehold.co/300x300.png", dataAiHint:"pastor portrait" },
              { name: "[Name]", role: "Head Diacon", image: "https://placehold.co/300x300.png", dataAiHint:"church leader" },
            ].map(leader => (
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
