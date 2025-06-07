
import AppLayout from "@/components/layout/AppLayout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import AboutSnippet from "@/components/home/AboutSnippet";

export default function HomePage() {
  return (
    <AppLayout>
      <div className="space-y-12 md:space-y-16 lg:space-y-20">
        <HeroSection />
        <FeaturedEvents />
        <AboutSnippet />
      </div>
    </AppLayout>
  );
}
