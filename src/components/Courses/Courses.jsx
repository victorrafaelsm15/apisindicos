import { useEffect, useState } from 'react';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { newsStore } from '../../lib/stores';
import { courses as fallbackCourses } from '../../data/siteContent';
import styles from './Courses.module.css';

export default function Courses() {
  const [items, setItems] = useState(fallbackCourses.map((c, i) => ({ id: `fb-${i}`, ...c })));

  useEffect(() => {
    newsStore.list({ category: 'curso' }).then((data) => {
      if (data?.length) setItems(data);
    }).catch(() => {});
  }, []);

  return (
    <section className={`section ${styles.section}`} id="cursos">
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">Formação Continuada</span>
          <h2 className="section-title" style={{ fontSize: 'clamp(26px,3vw,36px)', margin: '12px 0' }}>
            Curso Gratuito de Formação de Síndico
          </h2>
          <p className="section-sub" style={{ maxWidth: 560 }}>
            Programa de capacitação oferecido pela APIS em parceria com profissionais especializados,
            cobrindo os principais pilares da gestão condominial.
          </p>
        </div>

        <div className={styles.grid}>
          {items.map((c) => (
            <div key={c.id} className={styles.card}>
              {c.image_url && <img src={c.image_url} alt={c.title} className={styles.cover} />}
              <span className={styles.badge}><GraduationCap size={13} /> {c.aula || c.category}</span>
              <h3>{c.title}</h3>
              <p>{c.subtitle || c.excerpt}</p>
            </div>
          ))}
        </div>

        <div className={styles.ctaRow}>
          <a href="https://instagram.com/apisindicos" target="_blank" rel="noreferrer" className={styles.ctaLink}>
            Ver todos os cursos no Instagram <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
