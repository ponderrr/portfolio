import { motion } from 'framer-motion';
import { Project } from '@/types';
import { ProjectIcon } from './ProjectIcon';
import { StatusBadge } from './StatusBadge';
import { TechTag } from './TechTag';
import { useProjectStore } from '@/stores/projectStore';
import { CornerBrackets } from '../ui/CornerBrackets';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const setSelectedProject = useProjectStore((state) => state.setSelectedProject);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      whileHover={{ y: -8 }}
      onClick={() => setSelectedProject(project)}
      className="relative bg-black-elevated border border-gray-dark p-8 cursor-pointer group overflow-hidden"
    >
      {/* Corner brackets */}
      <CornerBrackets className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Hover border glow */}
      <div className="absolute inset-0 border-2 border-orange-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: '0 0 20px rgba(255, 69, 0, 0.5)' }} />

      {/* Top section */}
      <div className="flex justify-between items-start mb-6">
        <ProjectIcon icon={project.icon} size={48} />
        <StatusBadge status={project.status} />
      </div>

      {/* Title & Codename */}
      <h3 className="text-2xl font-heading font-bold text-white mb-2">
        {project.title}
      </h3>
      <p className="text-sm font-mono text-orange-primary mb-1">
        {project.codename}
      </p>
      <p className="text-xs font-mono text-gray-light mb-4">
        {project.type}
      </p>

      {/* Threat Level Badge */}
      <div className="inline-block px-3 py-1 bg-red-alert/20 border border-red-alert/50 text-red-alert text-xs font-mono mb-6">
        {project.threatLevel}
      </div>

      {/* Description - shown on hover */}
      <p className="text-sm text-white-dim mb-6 line-clamp-3 group-hover:line-clamp-none transition-all">
        {project.description}
      </p>

      {/* Tech Stack */}
      <div className="flex flex-wrap gap-2 mb-6">
        {project.tech.slice(0, 4).map((tech, i) => (
          <TechTag key={tech} tech={tech} delay={index * 0.15 + i * 0.05} />
        ))}
        {project.tech.length > 4 && (
          <span className="text-xs font-mono text-gray-light">+{project.tech.length - 4}</span>
        )}
      </div>

      {/* Bottom CTA - appears on hover */}
      <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-sm font-mono text-orange-primary">
          VIEW MISSION →
        </span>
        
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-white-dim hover:text-orange-primary transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
        )}
      </div>

      {/* Scan line effect on hover */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-0.5 bg-orange-primary opacity-0 group-hover:opacity-50 transition-opacity"
      />
    </motion.div>
  );
};
