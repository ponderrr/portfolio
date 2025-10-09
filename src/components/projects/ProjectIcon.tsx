interface ProjectIconProps {
  icon: string;
  size?: number;
}

export const ProjectIcon = ({ icon, size = 64 }: ProjectIconProps) => {
  const icons = {
    globe: (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" stroke="#ff4500" strokeWidth="2" opacity="0.3"/>
        <path d="M32 4v56M4 32h56M12 12l40 40M52 12L12 52" stroke="#ff4500" strokeWidth="1" opacity="0.5"/>
        <circle cx="32" cy="32" r="4" fill="#ff4500"/>
      </svg>
    ),
    brain: (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M20 32c0-8 4-16 12-16s12 8 12 16-4 16-12 16-12-8-12-16z" stroke="#ff4500" strokeWidth="2" opacity="0.3"/>
        <circle cx="28" cy="28" r="3" fill="#ff4500" opacity="0.6"/>
        <circle cx="36" cy="28" r="3" fill="#ff4500" opacity="0.6"/>
        <circle cx="32" cy="36" r="3" fill="#ff4500" opacity="0.6"/>
        <path d="M24 24l8 8M40 24l-8 8M28 32l4 8M36 32l-4 8" stroke="#ff4500" strokeWidth="1" opacity="0.4"/>
      </svg>
    ),
    radar: (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" stroke="#ff4500" strokeWidth="2" opacity="0.2"/>
        <circle cx="32" cy="32" r="20" stroke="#ff4500" strokeWidth="1.5" opacity="0.3"/>
        <circle cx="32" cy="32" r="12" stroke="#ff4500" strokeWidth="1" opacity="0.4"/>
        <line x1="32" y1="32" x2="52" y2="20" stroke="#ff4500" strokeWidth="2"/>
        <circle cx="52" cy="20" r="3" fill="#ff4500"/>
        <circle cx="20" cy="40" r="2" fill="#ff4500" opacity="0.6"/>
        <circle cx="44" cy="44" r="2" fill="#ff4500" opacity="0.6"/>
      </svg>
    ),
    microscope: (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <rect x="28" y="16" width="8" height="24" stroke="#ff4500" strokeWidth="2" opacity="0.3"/>
        <circle cx="32" cy="32" r="8" stroke="#ff4500" strokeWidth="2" opacity="0.4"/>
        <line x1="20" y1="48" x2="44" y2="48" stroke="#ff4500" strokeWidth="2"/>
        <circle cx="32" cy="32" r="3" fill="#ff4500"/>
        <path d="M24 24l16 16M40 24L24 40" stroke="#ff4500" strokeWidth="1" opacity="0.3"/>
      </svg>
    ),
  };

  return (
    <div className="flex items-center justify-center">
      {icons[icon as keyof typeof icons] || icons.globe}
    </div>
  );
};
