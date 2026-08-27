import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { newsStore } from '../../lib/stores';
import { normalizeExternalUrl, hostnameOf } from '../../lib/url';
import styles from './News.module.css';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

function openExternalLink(e, url) {
  e.preventDefault();
  e.stopPropagation();
  window.open(normalizeExternalUrl(url), '_blank', 'noopener');
}

export default function News() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    newsStore.list()
      .then((data) => setItems(data || []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section className={`section ${styles.section}`} id="noticias">
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">Fique por dentro</span>
          <h2 className="section-title" style={{ fontSize: 'clamp(26px,3vw,36px)', margin: '12px 0' }}>
            Notícias
          </h2>
        </div>

        {loaded && items.length === 0 ? (
          <p className={styles.empty}>Em breve, novidades por aqui.</p>
        ) : (
          <div className={styles.grid}>
            {items.map((n) => (
              <Link key={n.id} to={`/noticias/${n.id}`} className={styles.card}>
                {n.image_url && <img src={n.image_url} alt="" className={styles.cover} />}
                <div className={styles.body}>
                  {n.category && <span className={styles.tag}>{n.category}</span>}
                  <h3>{n.title}</h3>
                  {n.external_link && (
                    <button type="button" className={styles.externalLink} onClick={(e) => openExternalLink(e, n.external_link)}>
                      <ExternalLink size={12} /> {hostnameOf(n.external_link)}
                    </button>
                  )}
                  {n.subtitle && <p>{n.subtitle}</p>}
                  {n.created_at && <span className={styles.date}>{formatDate(n.created_at)}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
