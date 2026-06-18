import { Footer } from "@/components/footer";
import Header from "@/components/header";
import { PatternPlaceholder } from "@/components/pattern-placeholder";
import { ProfessionsSection } from "@/components/professions-section";
import { navigationItems } from "./data/navigation";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <>
      <section className="relative min-h-screen w-full">
        {/* Header Section */}
        <Header navigationData={navigationItems} />
        <PatternPlaceholder />

        {/* Background Pattern */}
        <div className="absolute top-0 left-0 right-0 h-[160vh] z-0">
          <div
            className="w-full h-full"
            style={{
              background:
                "radial-gradient(125% 125% at 50% 90%, var(--background) 45%, var(--primary) 100%)",
            }}
          />
        </div>

        <div className="relative z-10">
          <ProfessionsSection />
        </div>
      </section>
      <Footer />
    </>
  );
}
