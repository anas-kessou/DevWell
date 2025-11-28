import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import PurposeSection from '../components/PurposeSection';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <AboutSection />
      <PurposeSection />
      <Footer />
    </div>
  );
}
