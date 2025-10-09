import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectStore } from '@/stores/projectStore';
import { ProjectIcon } from './ProjectIcon';
import { StatusBadge } from './StatusBadge';
import { TechTag } from './TechTag';
import { Button } from '../base/Button';
import { CornerBrackets } from '../ui/CornerBrackets';

export const ProjectModal = () => {
  const { selectedProject, setSelectedProject } = useProjectStore();

  // Lock body scroll when modal open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProject]);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedProject) {
        setSelectedProject(null);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedProject, setSelectedProject]);

  if (!selectedProject) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setSelectedProject(null)}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-2xl h-full bg-black-elevated border-l-2 border-orange-primary overflow-y-auto project-modal-content"
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: '#ff4500 #1a1a1a'
          }}
        >
          {/* Corner brackets */}
          <CornerBrackets size="lg" />

          {/* Header */}
          <div className="sticky top-0 bg-black-elevated/95 backdrop-blur-lg border-b border-gray-dark p-8 z-10">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white-dim hover:text-orange-primary transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <ProjectIcon icon={selectedProject.icon} size={80} />
              <h2 className="text-4xl font-heading font-bold text-white mt-6 mb-2">
                {selectedProject.title}
              </h2>
              <p className="text-lg font-mono text-orange-primary mb-2">
                {selectedProject.codename}
              </p>
              <div className="flex items-center gap-4 text-sm font-mono text-gray-light">
                <span>{selectedProject.type}</span>
                <span>•</span>
                <StatusBadge status={selectedProject.status} />
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Threat Level */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="inline-block px-4 py-2 bg-red-alert/20 border border-red-alert text-red-alert text-sm font-mono">
                CLASSIFICATION: {selectedProject.threatLevel}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xs font-mono text-orange-primary mb-3 tracking-wider">
                // MISSION OVERVIEW
              </h3>
              <p className="text-base text-white-dim leading-relaxed">
                {selectedProject.description}
              </p>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="h-px bg-gradient-to-r from-transparent via-orange-primary to-transparent"
            />

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xs font-mono text-orange-primary mb-4 tracking-wider">
                // KEY FEATURES
              </h3>
              <div className="space-y-3">
                {selectedProject.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (index * 0.1) }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 w-5 h-5 flex-shrink-0 flex items-center justify-center border border-orange-primary rounded-sm">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l2.5 2.5L10 3" stroke="#ff4500" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span className="text-sm text-white-dim">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Tech Stack */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-xs font-mono text-orange-primary mb-4 tracking-wider">
                // TECH STACK
              </h3>
              <div className="flex flex-wrap gap-3">
                {selectedProject.tech.map((tech, index) => (
                  <TechTag key={tech} tech={tech} delay={0.9 + (index * 0.05)} />
                ))}
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              className="h-px bg-gradient-to-r from-transparent via-orange-primary to-transparent"
            />

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              {selectedProject.github && (
                <Button
                  href={selectedProject.github}
                  variant="secondary"
                  size="lg"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  VIEW CODE
                </Button>
              )}
              
              {selectedProject.liveUrl && (
                <Button
                  href={selectedProject.liveUrl}
                  variant="primary"
                  size="lg"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  LAUNCH SITE
                </Button>
              )}
            </motion.div>
          </div>

          {/* Scan line effect */}
          <motion.div
            className="absolute top-0 left-0 w-full h-0.5 bg-orange-primary opacity-50"
            animate={{
              y: ['0vh', '100vh'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
