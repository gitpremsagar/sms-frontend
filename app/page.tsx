import { About } from "@/components/landing/about";
import { Contact } from "@/components/landing/contact";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { Programs } from "@/components/landing/programs";
import { Stats } from "@/components/landing/stats";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Programs />
        <Stats />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
