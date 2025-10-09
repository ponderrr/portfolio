import { motion } from 'framer-motion';
import { Container } from '../base/Container';
import { SkillCategory } from './SkillCategory';
import { SKILLS } from '@/utils/constants';

export const SkillsSection = () => {
  return (
    <section id="skills" className="py-32 px-6 bg-black-elevated">
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
            // CAPABILITIES
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6">
            Arsenal
          </h2>
          
          <p className="text-lg text-white-dim max-w-2xl mx-auto">
            Technical skills and tools honed through building real-world projects and solving complex problems.
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <SkillCategory 
            title="FRONTEND DEVELOPMENT" 
            skills={SKILLS.frontend}
            delay={0.2}
          />
          <SkillCategory 
            title="BACKEND & DATA" 
            skills={SKILLS.backend}
            delay={0.3}
          />
          <SkillCategory 
            title="TOOLS & WORKFLOW" 
            skills={SKILLS.tools}
            delay={0.4}
          />
          <SkillCategory 
            title="AI & AUTOMATION" 
            skills={SKILLS.ai}
            delay={0.5}
          />
        </div>
      </Container>
    </section>
  );
};

