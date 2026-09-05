import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { Hero } from "../sections/Hero";
import { About } from "../sections/About";
import { Services } from "../sections/Services";
import { Visualization } from "../sections/Visualization";
import { WhyChooseUs } from "../sections/WhyChooseUs";
import { PatientJourney } from "../sections/PatientJourney";
import { Clinic } from "../sections/Clinic";
import { Contact } from "../sections/Contact";

export function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <About />
        <Services />
        <Visualization />
        <WhyChooseUs />
        <PatientJourney />
        <Clinic />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
