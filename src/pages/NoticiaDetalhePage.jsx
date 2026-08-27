import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Loader, Group } from '@mantine/core';
import { ExternalLink } from 'lucide-react';
import PageHeader from '../components/PageHeader/PageHeader';
import { newsStore } from '../lib/stores';
import styles from './NoticiaDetalhePage.module.css';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function NoticiaDetalhePage() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    newsStore.get(id)
      .then((data) => setNews(data))
      .catch(() => setNews(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <Group justify="center" py={100}><Loader color="blue" /></Group>;
  }

  if (!news) {
    return (
      <>
        <PageHeader title="Notícia não encontrada" subtitle="Esta notícia pode ter sido removida." />
        <section className={`section ${styles.section}`}>
          <div className="container">
            <p className={styles.notFound}>
              <Link to="/noticias">← Voltar para todas as notícias</Link>
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title={news.title} subtitle={news.subtitle || undefined} />
      <section className={`section ${styles.section}`}>
        <div className={`container ${styles.wrap}`}>
          {news.image_url && <img src={news.image_url} alt="" className={styles.cover} />}

          {(news.category || news.aula) && (
            <div className={styles.tags}>
              {news.category && <span className={styles.tag}>{news.category}</span>}
              {news.aula && <span className={styles.tag}>{news.aula}</span>}
            </div>
          )}

          {news.created_at && <span className={styles.date}>{formatDate(news.created_at)}</span>}

          {news.subtitle && <p className={styles.description}>{news.subtitle}</p>}

          {news.external_link && (
            <div className={styles.actions}>
              <Button
                component="a"
                href={news.external_link}
                target="_blank"
                rel="noreferrer"
                variant="outline"
                radius="xl"
                color="blue.7"
                leftSection={<ExternalLink size={16} />}
              >
                Ler matéria completa
              </Button>
            </div>
          )}

          <Link to="/noticias" className={styles.back}>← Voltar para todas as notícias</Link>
        </div>
      </section>
    </>
  );
}
