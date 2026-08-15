import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { objectives } from '../../data/siteContent';
import styles from './About.module.css';
import objStyles from './Objectives.module.css';

const ICON_NAMES = ['ShieldCheck', 'GraduationCap', 'Scale', 'HeartHandshake', 'Award', 'Search'];

export default function Objectives() {
  return (
    <section className={`section ${objStyles.section}`}>
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">O que fazemos</span>
          <h2 className={`section-title ${styles.title}`}>Nossos objetivos estatutários</h2>
        </div>
        <div className={objStyles.grid}>
          {objectives.map((o, i) => {
            const Icon = Icons[ICON_NAMES[i]] || Icons.Star;
            return (
              <motion.div
                key={o.title}
                className={objStyles.card}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              >
                <span className={objStyles.iconWrap}><Icon size={20} /></span>
                <h3>{o.title}</h3>
                <p>{o.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
