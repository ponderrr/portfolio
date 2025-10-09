import { motion } from 'framer-motion';
import { SkillBar } from './SkillBar';

interface SkillCategoryProps {
  title: string;
  skills: Array<{ name: string; level: number }>;
  delay?: number;
}

export const SkillCategory = ({ title, skills, delay = 0 }: SkillCategoryProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ delay, duration: 0.6 }}
      className="space-y-4"
    >
      <h3 className="text-xs font-mono text-orange-primary tracking-wider mb-6 border-b border-orange-primary/30 pb-2">
        // {title}
      </h3>
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <SkillBar
            key={skill.name}
            name={skill.name}
            level={skill.level}
            delay={delay + 0.1 + (index * 0.1)}
          />
        ))}
      </div>
    </motion.div>
  );
};

