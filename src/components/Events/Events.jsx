import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { eventsStore } from '../../lib/stores';
import { parseEventDate, formatFullEventDate, eventMonthShort } from '../../lib/eventDate';
import styles from './Events.module.css';

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
                <Link key={e.id} to={`/eventos/${e.id}`} className={styles.card}>
                  {d && (
                    <div className={styles.dateBadge}>
                      <span className={styles.day}>{String(d.day).padStart(2, '0')}</span>
                      <span className={styles.month}>{eventMonthShort(e.event_date)}</span>
                    </div>
                  )}
                  {e.image_url && <img src={e.image_url} alt="" className={styles.cover} />}
                  <div className={styles.info}>
                    <h3>{e.title}</h3>
                    <div className={styles.meta}>
                      {e.location && (<><MapPin size={13} /> {e.location}</>)}
                      {e.location && e.event_date && ' · '}
                      {e.event_date && formatFullEventDate(e.event_date)}
                    </div>
                    {e.description && <p>{e.description}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
