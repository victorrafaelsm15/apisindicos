import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { eventsStore } from '../../lib/stores';
import styles from './Events.module.css';

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function parseEventDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

function formatFullDate(value) {
  const d = parseEventDate(value);
  if (!d) return '';
  return `${String(d.day).padStart(2, '0')} de ${MONTHS[d.month - 1]}. de ${d.year}`;
}

export default function Events() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    eventsStore.list()
      .then((data) => setItems(data || []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section className={`section ${styles.section}`} id="eventos">
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">Agenda</span>
          <h2 className="section-title" style={{ fontSize: 'clamp(26px,3vw,36px)', margin: '12px 0' }}>
            Eventos
          </h2>
        </div>

        {loaded && items.length === 0 ? (
          <p className={styles.empty}>Em breve, novidades por aqui.</p>
        ) : (
          <div className={styles.list}>
            {items.map((e) => {
              const d = parseEventDate(e.event_date);
              return (
                <div key={e.id} className={styles.card}>
                  {d && (
                    <div className={styles.dateBadge}>
                      <span className={styles.day}>{String(d.day).padStart(2, '0')}</span>
                      <span className={styles.month}>{MONTHS[d.month - 1]}</span>
                    </div>
                  )}
                  {e.image_url && <img src={e.image_url} alt="" className={styles.cover} />}
                  <div className={styles.info}>
                    <h3>{e.title}</h3>
                    <div className={styles.meta}>
                      {e.location && (<><MapPin size={13} /> {e.location}</>)}
                      {e.location && e.event_date && ' · '}
                      {e.event_date && formatFullDate(e.event_date)}
                    </div>
                    {e.description && <p>{e.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
