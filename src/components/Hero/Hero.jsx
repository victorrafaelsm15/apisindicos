import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@mantine/core';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { siteInfo } from '../../data/siteContent';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.blob} />
      <div className={`container ${styles.grid}`}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow">Associação Piauiense de Síndicos</span>
          <h1 className={styles.title}>
            {siteInfo.tagline}
          </h1>
          <p className={styles.subtitle}>
            Representação institucional, capacitação técnica e suporte jurídico para
            síndicos de todo o Estado do Piauí. Profissionalize-se com a gente.
          </p>
          <div className={styles.actionsRow}>
            <Button component={Link} to="/filiacao" size="lg" radius="xl" color="blue.7" rightSection={<ArrowRight size={17} />}>
              Quero me associar
            </Button>
            <Button component="a" href="/cursos" size="lg" radius="xl" variant="outline" color="blue.7" leftSection={<GraduationCap size={17} />}>
              Ver cursos gratuitos
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
