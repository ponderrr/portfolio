import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../base/Button';

export const ContactForm = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    // EmailJS integration (optional - configure with your keys)
    // For now, just simulate success
    setTimeout(() => {
      setStatus('success');
      setFormState({ name: '', email: '', message: '' });
      
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.6 }}
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-xs font-mono text-orange-primary mb-2 tracking-wider">
          // NAME
        </label>
        <input
          type="text"
          id="name"
          required
          value={formState.name}
          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
          className="w-full px-4 py-3 bg-black-elevated border border-gray-dark text-white font-mono text-sm focus:border-orange-primary focus:outline-none transition-colors"
          placeholder="Enter your name"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-xs font-mono text-orange-primary mb-2 tracking-wider">
          // EMAIL
        </label>
        <input
          type="email"
          id="email"
          required
          value={formState.email}
          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
          className="w-full px-4 py-3 bg-black-elevated border border-gray-dark text-white font-mono text-sm focus:border-orange-primary focus:outline-none transition-colors"
          placeholder="your.email@example.com"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-xs font-mono text-orange-primary mb-2 tracking-wider">
          // MESSAGE
        </label>
        <textarea
          id="message"
          required
          value={formState.message}
          onChange={(e) => setFormState({ ...formState, message: e.target.value })}
          rows={6}
          className="w-full px-4 py-3 bg-black-elevated border border-gray-dark text-white font-mono text-sm focus:border-orange-primary focus:outline-none transition-colors resize-none"
          placeholder="Tell me about your project..."
        />
      </div>

      {/* Submit Button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
      >
        {status === 'sending' ? 'TRANSMITTING...' : 'TRANSMIT MESSAGE'}
      </Button>

      {/* Status Messages */}
      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border border-green-500 bg-green-500/10 text-green-500 text-sm font-mono text-center"
        >
          ✓ MESSAGE TRANSMITTED SUCCESSFULLY
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border border-red-alert bg-red-alert/10 text-red-alert text-sm font-mono text-center"
        >
          ✗ TRANSMISSION FAILED - PLEASE TRY AGAIN
        </motion.div>
      )}
    </motion.form>
  );
};

