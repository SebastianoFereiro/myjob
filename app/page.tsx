import { Footer } from "@/components/footer";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section-01";
import { PatternPlaceholder } from "@/components/pattern-placeholder";
import { navigationItems } from "./data/navigation";
import { getCategories } from "@/services/categories.service";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    location?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.query || "";
  const location = params.location || "";
  const type = params.type || "";
  const page = params.page ? parseInt(params.page, 10) : 1;

  return (
    <>
      <section className="relative min-h-screen w-full">
        {/* Header Section */}
        <Header navigationData={navigationItems} />
        <PatternPlaceholder />

        {/* Background Pattern */}
        {/* Top Primary Radial Background Pattern */}
        {/* <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(125% 125% at 50% 90%, var(--background) 55%, var(--primary) 100%)",
          }}
        /> */}
        <div className="absolute top-0 left-0 right-0 h-[160vh] z-0">
          <div
            className="w-full h-full"
            style={{
              background:
                "radial-gradient(125% 125% at 50% 90%, var(--background) 45%, var(--primary) 100%)",
            }}
          />
        </div>
      </section>
      <Footer />
    </>
  );
}
