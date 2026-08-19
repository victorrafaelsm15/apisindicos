import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@mantine/core';
import { membershipCategories, membershipRequirements, memberBenefits } from '../../data/siteContent';
import styles from './Membership.module.css';

export default function Membership() {
  return (
    <section className={`section ${styles.section}`} id="filiacao">
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>Associe-se</span>
          <h2 className={styles.title}>Faça parte da APIS</h2>
          <p className={styles.subtitle}>
            A associação é aberta a síndicos que já exerceram ou estão em exercício de mandato,
            em condomínios residenciais, comerciais, mistos ou equiparados.
          </p>
        </div>

        <div className={styles.grid}>
          {membershipCategories.map((c) => (
            <div key={c.title} className={styles.categoryCard}>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailCard}>
            <h4>Documentos necessários</h4>
            <ul>
              {membershipRequirements.map((r) => (
                <li key={r}><CheckCircle2 size={15} /> {r}</li>
              ))}
            </ul>
          </div>
          <div className={styles.detailCard}>
            <h4>Benefícios do associado</h4>
            <ul>
              {memberBenefits.map((b) => (
                <li key={b}><CheckCircle2 size={15} /> {b}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.ctaRow}>
          <Button component={Link} to="/filiacao" size="lg" radius="xl" color="gray.0" c="blue.9" fw={700}>
            Preencher ficha de inscrição
          </Button>
        </div>
      </div>
    </section>
  );
}
