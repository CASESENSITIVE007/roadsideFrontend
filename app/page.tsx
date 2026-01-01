// app/page.tsx
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ServicesBar from '@/components/ServicesBar';
import Features from '@/components/Features';
import LiveMap from '@/components/LiveMap';
import ProviderCTA from '@/components/ProviderCTA';
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {/* Wrap Hero in a specific bg color per your original design */}
        <section className="bg-background-light dark:bg-[#111418]">
          <Hero />
        </section>

        <ServicesBar />
        <Features />
        <LiveMap />
        <ProviderCTA />
      </main>

      <Footer />
    </div>
  );
}