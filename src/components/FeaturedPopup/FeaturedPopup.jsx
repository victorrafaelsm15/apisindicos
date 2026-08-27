import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@mantine/core';
import { eventsStore, newsStore } from '../../lib/stores';
import { formatFullEventDate } from '../../lib/eventDate';
import styles from './FeaturedPopup.module.css';

const POPUP_DELAY_MS = 1500;

function formatNewsDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

// Shows at most one featured pop-up per visit: an event and a news item can
// both be marked as featured independently in the admin panel, but only one
// pop-up is ever shown at a time, never stacked. The event wins when both are
// set, since events are usually time-sensitive (dates, registration deadlines).
export default function FeaturedPopup() {
  const [item, setItem] = useState(null);
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    Promise.all([eventsStore.list(), newsStore.list()])
      .then(([events, news]) => {
        const featuredEvent = (events || []).find((e) => e.is_featured_popup);
        const featuredNews = (news || []).find((n) => n.is_featured_popup);
        const picked = featuredEvent
          ? { kind: 'event', data: featuredEvent }
          : featuredNews
            ? { kind: 'news', data: featuredNews }
            : null;
        if (!picked) return;

        const seenKey = `apis_popup_seen_${picked.kind}_${picked.data.id}`;
        if (sessionStorage.getItem(seenKey)) return;
        setItem(picked);
        timer = setTimeout(() => setOpened(true), POPUP_DELAY_MS);
      })
      .catch(() => {});
    return () => clearTimeout(timer);
  }, []);

  const markSeen = () => {
    if (item) sessionStorage.setItem(`apis_popup_seen_${item.kind}_${item.data.id}`, '1');
  };

  const close = () => {
    markSeen();
    setOpened(false);
  };

  const goToItem = () => {
    markSeen();
    setOpened(false);
    navigate(item.kind === 'event' ? `/eventos/${item.data.id}` : `/noticias/${item.data.id}`);
  };

  if (!item) return null;
  const { kind, data } = item;
  const dateLabel = kind === 'event' ? formatFullEventDate(data.event_date) : formatNewsDate(data.created_at);
  const summary = kind === 'event' ? data.description : data.subtitle;

  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size="md"
      radius="lg"
      title={kind === 'event' ? 'Evento em destaque' : 'Notícia em destaque'}
    >
      <div className={styles.clickArea} onClick={goToItem}>
        {data.image_url && <img src={data.image_url} alt="" className={styles.cover} />}
        <h3>{data.title}</h3>
        {dateLabel && <span className={styles.date}>{dateLabel}</span>}
        {summary && <p>{summary}</p>}
        <span className={styles.hint}>Ver detalhes →</span>
      </div>
    </Modal>
  );
}
