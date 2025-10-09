import { motion } from 'framer-motion';
import { Container } from '../base/Container';
import { CornerBrackets } from '../ui/CornerBrackets';

const highlights = [
  {
    title: 'Technical Precision',
    description: 'Clean code, modern frameworks, and attention to performance'
  },
  {
    title: 'Creative Vision',
    description: 'Transforming ideas into engaging digital experiences'
  },
  {
    title: 'Full-Stack Capability',
    description: 'From front-end design to back-end architecture'
  },
  {
    title: 'AI Integration',
    description: 'Leveraging cutting-edge AI tools to build smarter solutions'
  },
];

export const AboutSection = () => {
  return (
    <section id="about" className="py-32 px-6 bg-black-base relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-primary rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-glow rounded-full blur-3xl" />
      </div>

      <Container size="lg" className="relative z-10">
        {/* Mission Statement */}
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
            // AGENT PROFILE
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-8 max-w-4xl mx-auto leading-tight">
            "I like design, and bringing a creative vision to life."
          </h2>
          
          <p className="text-xl text-white-dim max-w-3xl mx-auto leading-relaxed mb-12">
            I'm a web developer and designer focused on creating digital solutions that combine technical precision with creative design. 
            Whether it's building AI-powered applications, automating complex workflows, or crafting engaging user interfaces, 
            I approach every project with curiosity and a commitment to quality.
          </p>

          <div className="relative inline-block">
            <CornerBrackets className="opacity-30" size="md" />
            <p className="text-base font-mono text-gray-light px-8 py-4">
              Currently studying Information Technology at SELU | Expected graduation: May 2026
            </p>
          </div>
        </motion.div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {highlights.map((highlight, index) => (
            <motion.div
              key={highlight.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -4 }}
              className="relative bg-black-elevated border border-gray-dark p-6 group cursor-default"
            >
              <div className="absolute inset-0 border border-orange-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <h3 className="text-xl font-heading font-bold text-white mb-3 relative z-10">
                {highlight.title}
              </h3>
              <p className="text-sm text-white-dim relative z-10">
                {highlight.description}
              </p>

              {/* Animated corner accent */}
              <motion.div
                className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-orange-primary opacity-0 group-hover:opacity-50"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};

