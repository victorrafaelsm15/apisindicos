import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@mantine/core';
import { eventsStore } from '../../lib/stores';
import { formatFullEventDate } from '../../lib/eventDate';
import styles from './EventPopup.module.css';

const POPUP_DELAY_MS = 1500;

export default function EventPopup() {
  const [event, setEvent] = useState(null);
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    eventsStore.list()
      .then((data) => {
        const featured = (data || []).find((e) => e.is_featured_popup);
        if (!featured) return;
        const seenKey = `apis_event_popup_seen_${featured.id}`;
        if (sessionStorage.getItem(seenKey)) return;
        setEvent(featured);
        timer = setTimeout(() => setOpened(true), POPUP_DELAY_MS);
      })
      .catch(() => {});
    return () => clearTimeout(timer);
  }, []);

  const markSeen = () => {
    if (event) sessionStorage.setItem(`apis_event_popup_seen_${event.id}`, '1');
  };

  const close = () => {
    markSeen();
    setOpened(false);
  };

  const goToEvent = () => {
    markSeen();
    setOpened(false);
    navigate(`/eventos/${event.id}`);
  };

  if (!event) return null;

  return (
    <Modal opened={opened} onClose={close} centered size="md" radius="lg" title="Evento em destaque">
      <div className={styles.clickArea} onClick={goToEvent}>
        {event.image_url && <img src={event.image_url} alt="" className={styles.cover} />}
        <h3>{event.title}</h3>
        {event.event_date && <span className={styles.date}>{formatFullEventDate(event.event_date)}</span>}
        {event.description && <p>{event.description}</p>}
        <span className={styles.hint}>Ver detalhes →</span>
      </div>
    </Modal>
  );
}
