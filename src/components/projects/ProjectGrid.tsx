import { useProjectStore } from '@/stores/projectStore';
import { ProjectCard } from './ProjectCard';

export const ProjectGrid = () => {
  const projects = useProjectStore((state) => state.projects);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} />
      ))}
    </div>
  );
};
