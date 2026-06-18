/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeProvider } from "./context/ThemeContext";
import Navigation from "./components/Navigation";
import { useLocation } from "./lib/router";
import HeroSection from "./components/HeroSection";
import ProjectsClient from "./components/ProjectsClient";
import ExperienceSection from "./components/ExperienceSection";
import SkillsSection from "./components/SkillsSection";
import AboutSection from "./components/AboutSection";
import ContactSection from "./components/ContactSection";

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { pathname } = useLocation();

  const renderContent = () => {
    switch (pathname) {
      case "/":
        return <HeroSection />;
      case "/projects":
        return <ProjectsClient />;
      case "/experience":
        return <ExperienceSection />;
      case "/skills":
        return <SkillsSection />;
      case "/about":
        return <AboutSection />;
      case "/contact":
        return <ContactSection />;
      default:
        return <HeroSection />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-1000">
      <Navigation />
      <div className="flex-grow">
        {renderContent()}
      </div>
      {/* Footer copyright */}
      <footer className="py-8 text-center text-xs opacity-40 font-mono tracking-wider border-t border-[var(--color-border)]/20 mx-6">
        © 2026 S. Y. Sudharsshan · Embedded & IoT Systems · Made in India
      </footer>
    </div>
  );
}

