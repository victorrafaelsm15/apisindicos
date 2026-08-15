import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { documentsStore } from '../../lib/stores';
import styles from './Documents.module.css';

const FALLBACK = [
  { id: 'fb-1', title: 'Estatuto Social da APIS (consolidado)', description: 'Versão consolidada com as alterações aprovadas em Assembleia Geral Extraordinária de 18/06/2026.', file_url: '#' },
];

export default function Documents() {
  const [docs, setDocs] = useState(FALLBACK);

  useEffect(() => {
    documentsStore.list().then((data) => { if (data?.length) setDocs(data); }).catch(() => {});
  }, []);

  return (
    <section className={`section ${styles.section}`} id="documentos">
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">Transparência</span>
          <h2 className="section-title" style={{ fontSize: 'clamp(26px,3vw,36px)', margin: '12px 0' }}>
            Documentos institucionais
          </h2>
        </div>
        <div className={styles.list}>
          {docs.map((d) => (
            <a key={d.id} href={d.file_url} target="_blank" rel="noreferrer" className={styles.card}>
              <span className={styles.iconWrap}><FileText size={20} /></span>
              <div className={styles.info}>
                <h3>{d.title}</h3>
                {d.description && <p>{d.description}</p>}
              </div>
              <Download size={17} className={styles.downloadIcon} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
