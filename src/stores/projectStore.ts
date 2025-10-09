import { create } from 'zustand';
import { Project } from '@/types';

interface ProjectStore {
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [
    {
      id: 1,
      title: "Web Development Agency",
      codename: "OPERATION: PHOENIX",
      type: "Business Website",
      status: "ACTIVE",
      threatLevel: "HIGH IMPACT",
      tech: ["React", "Tailwind CSS", "Framer Motion", "TypeScript"],
      description: "Full-service web development agency showcasing client portfolio and service offerings with modern design patterns.",
      features: [
        "Client portfolio showcase",
        "Service offerings catalog",
        "Contact & booking system",
        "Responsive design system"
      ],
      github: "https://github.com/ponderrr/agency-site",
      icon: "globe"
    },
    {
      id: 2,
      title: "Smart Advisor",
      codename: "OPERATION: ORACLE",
      type: "AI Web Application",
      status: "DEPLOYED",
      threatLevel: "CUTTING EDGE",
      tech: ["React", "TypeScript", "Supabase", "OpenAI GPT-4", "Serverless"],
      description: "AI-powered recommendation platform delivering personalized book and movie suggestions with real-time authentication.",
      features: [
        "Personalized AI recommendations",
        "Real-time authentication",
        "Serverless architecture",
        "99.9% uptime scalability"
      ],
      github: "https://github.com/ponderrr/smart-advisor",
      liveUrl: "https://smartadvisor.live",
      icon: "brain"
    },
    {
      id: 3,
      title: "Local Business Lead Generator",
      codename: "OPERATION: PROSPECTOR",
      type: "Python Automation",
      status: "OPERATIONAL",
      threatLevel: "STEALTH MODE",
      tech: ["Python", "Google Maps API", "Pandas", "Selenium"],
      description: "Intelligent business scraper with advanced anti-detection measures and smart chain verification system.",
      features: [
        "Scrapes 150+ business types",
        "Smart chain/website verification",
        "CSV export by city/category",
        "Rate limiting & resume capability",
        "Advanced anti-detection measures"
      ],
      github: "https://github.com/ponderrr/lead-generator",
      icon: "radar"
    },
    {
      id: 4,
      title: "Theory Validation System",
      codename: "OPERATION: VALIDATOR",
      type: "Research Automation",
      status: "ACTIVE",
      threatLevel: "EXPERIMENTAL",
      tech: ["Python", "Machine Learning", "Research APIs", "Natural Language Processing"],
      description: "Multi-phase research paper validation pipeline automating the entire validation process from parsing to synthesis.",
      features: [
        "Phase 1: Paper parsing & extraction",
        "Phase 2: Cross-paper claim analysis",
        "Phase 3: Code implementation generation",
        "Phase 4: Experimental validation",
        "Phase 5: Results synthesis",
        "Phase 6: Master paper generation"
      ],
      github: "https://github.com/ponderrr/theory-validator",
      icon: "microscope"
    }
  ],
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
}));

