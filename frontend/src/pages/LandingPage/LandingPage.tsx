import LandingNavbar from './components/LandingNavbar'
import HeroSection from './components/HeroSection'
import FeatureGrid from './components/FeatureGrid'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'
import ChatWidget from '../../shared/chat/ChatWidget'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeatureGrid />
        <HowItWorks />
      </main>
      <Footer />

      <ChatWidget />
    </div>
  )
}

