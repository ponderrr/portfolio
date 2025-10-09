import { motion } from 'framer-motion';
import { Container } from '../base/Container';
import { ProjectGrid } from './ProjectGrid';

export const ProjectsSection = () => {
  return (
    <section id="projects" className="py-32 px-6 relative bg-black-base">
      <Container size="lg">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div 
            className="inline-block px-4 py-2 border border-orange-primary/30 bg-orange-primary/5 text-orange-primary text-xs font-mono mb-6"
            whileHover={{ borderColor: 'rgba(255, 69, 0, 0.8)' }}
          >
            // ACTIVE OPERATIONS
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6">
            Mission Briefings
          </h2>
          
          <p className="text-lg text-white-dim max-w-2xl mx-auto">
            A selection of projects showcasing technical precision and creative execution across web development, AI applications, and automation systems.
          </p>
        </motion.div>

        {/* Project Grid */}
        <ProjectGrid />

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-sm font-mono text-gray-light">
            More operations launching soon...
          </p>
        </motion.div>
      </Container>
    </section>
  );
};
