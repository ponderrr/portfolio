import { useEffect } from 'react';

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Press 'h' to go to hero
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      // Press 'p' to go to projects
      if (e.key === 'p' && !e.ctrlKey && !e.metaKey) {
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Press 's' to go to skills
      if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Press 'a' to go to about
      if (e.key === 'a' && !e.ctrlKey && !e.metaKey) {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Press 'c' to go to contact
      if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Press '?' to show keyboard shortcuts
      if (e.key === '?') {
        alert('Keyboard Shortcuts:\n\nh - Home\np - Projects\ns - Skills\na - About\nc - Contact\nESC - Close modal');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
};

