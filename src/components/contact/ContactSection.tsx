import { motion } from 'framer-motion';
import { Container } from '../base/Container';
import { Button } from '../base/Button';
import { ContactForm } from './ContactForm';
import { SocialLinks } from './SocialLinks';

export const ContactSection = () => {
  return (
    <section id="contact" className="py-32 px-6 bg-black-base">
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
            // COMMUNICATIONS
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-heading font-bold text-white mb-6">
            Let's Connect
          </h2>
          
          <p className="text-lg text-white-dim max-w-2xl mx-auto mb-12">
            Have a project in mind or just want to chat? I'm always open to discussing new opportunities and creative collaborations.
          </p>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Button
              href="mailto:andrew.ponderrr@icloud.com"
              variant="primary"
              size="lg"
              className="text-base"
            >
              REQUEST BRIEFING →
            </Button>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="h-px bg-gradient-to-r from-transparent via-orange-primary to-transparent max-w-md mx-auto mb-20"
        />

        {/* Contact Form */}
        <div className="mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm font-mono text-gray-light mb-8"
          >
            // OR SEND A MESSAGE DIRECTLY
          </motion.p>
          <ContactForm />
        </div>

        {/* Social Links */}
        <div className="space-y-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm font-mono text-gray-light"
          >
            // FIND ME ON
          </motion.p>
          <SocialLinks />
        </div>
      </Container>
    </section>
  );
};

