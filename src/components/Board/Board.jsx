import { useEffect, useState } from 'react';
import { boardStore } from '../../lib/stores';
import { boardStructure } from '../../data/siteContent';
import styles from './Board.module.css';

export default function Board() {
  const [members, setMembers] = useState(
    boardStructure.map((b, i) => ({ id: `fb-${i}`, role: b.role, name: b.name }))
  );

  useEffect(() => {
    boardStore.list().then((data) => { if (data?.length) setMembers(data); }).catch(() => {});
  }, []);

  return (
    <section className={`section ${styles.section}`} id="diretoria">
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">Governança</span>
          <h2 className="section-title" style={{ fontSize: 'clamp(26px,3vw,36px)', margin: '12px 0' }}>
            Diretoria Executiva
          </h2>
          <p className="section-sub">Mandato de 3 anos, conforme Estatuto Social.</p>
        </div>
        <div className={styles.grid}>
          {members.map((m) => (
            <div key={m.id} className={styles.card}>
              {m.photo_url ? (
                <img src={m.photo_url} alt={m.name || m.role} className={styles.photo} />
              ) : (
                <div className={styles.photo}>{(m.name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('')}</div>
              )}
              <span className={styles.role}>{m.role}</span>
              <h3>{m.name || 'A definir'}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
