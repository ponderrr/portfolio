import { CustomCursor } from '@/components/ui/CustomCursor';
import { GridOverlay } from '@/components/layout/GridOverlay';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Hero } from '@/components/hero/Hero';
import { ProjectsSection } from '@/components/projects/ProjectsSection';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { Footer } from '@/components/layout/Footer';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import '@/styles/globals.css';

function App() {
  useKeyboardShortcuts();

  return (
    <>
      <LoadingScreen />
      <ScrollProgress />
      <CustomCursor />
      <GridOverlay />
      <ProjectModal />
      
      <div className="relative">
        <Hero />
        <ProjectsSection />
        <Footer />
      </div>
    </>
  );
}

export default App;
