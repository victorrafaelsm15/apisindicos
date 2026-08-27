import { ExternalLink } from 'lucide-react';
import styles from './PageHeader.module.css';

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function PageHeader({ title, subtitle, link }) {
  return (
    <div className={styles.banner}>
      <div className={`container ${styles.inner}`}>
        <h1 className={styles.title}>{title}</h1>
        {link && (
          <a href={link} target="_blank" rel="noreferrer" className={styles.link}>
            <ExternalLink size={13} /> {hostnameOf(link)}
          </a>
        )}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
}
