import { motion } from 'framer-motion';
import { Target, Eye, Heart } from 'lucide-react';
import { mission, vision, values, siteInfo } from '../../data/siteContent';
import styles from './About.module.css';

export default function About() {
  return (
    <section className={`section ${styles.section}`} id="sobre">
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">Quem somos</span>
          <h2 className={`section-title ${styles.title}`}>
            Uma associação criada por síndicos, para síndicos
          </h2>
          <p className="section-sub" style={{ maxWidth: 640 }}>
            A APIS nasceu em {siteInfo.foundedDate} da necessidade de dar à categoria de síndicos do
            Piauí uma representação institucional própria — técnica, jurídica e de capacitação contínua.
          </p>
        </div>

        <div className={styles.bento}>
          <motion.div className={`${styles.card} ${styles.cardMission}`} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <Target size={24} color="#fff" />
            <h3>Missão</h3>
            <p>{mission}</p>
          </motion.div>

          <motion.div className={styles.card} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Eye size={22} color="var(--blue)" />
            <h3>Visão</h3>
            <p>{vision}</p>
          </motion.div>

          <motion.div className={`${styles.card} ${styles.cardMission}`} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }}>
            <Heart size={22} color="#fff" />
            <h3>Valores</h3>
            <div className={styles.tagList}>
              {values.map((v) => <span key={v} className={styles.tag}>{v}</span>)}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
