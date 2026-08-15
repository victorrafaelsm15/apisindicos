import { useEffect, useState } from 'react';
import { partnersStore } from '../../lib/stores';
import styles from './Partners.module.css';

const FALLBACK = ['Pague e Leve', 'Ecozilla', 'Ala Elétrica', 'Carvalho Costa', 'Armazzem', 'SECOPI'];

export default function Partners() {
  const [partners, setPartners] = useState(FALLBACK.map((name, i) => ({ id: `fb-${i}`, name })));

  useEffect(() => {
    partnersStore.list().then((data) => { if (data?.length) setPartners(data); }).catch(() => {});
  }, []);

  const loop = [...partners, ...partners];

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">Rede de apoio</span>
          <h2 className="section-title" style={{ fontSize: 'clamp(22px,3vw,30px)', margin: '10px 0' }}>Parceiros</h2>
        </div>
      </div>
      <div className={styles.marquee}>
        <div className={styles.track}>
          {loop.map((p, i) => <div key={`${p.id}-${i}`} className={styles.logo}>{p.name}</div>)}
        </div>
      </div>
    </section>
  );
}
