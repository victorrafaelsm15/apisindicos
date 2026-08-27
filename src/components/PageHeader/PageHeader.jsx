import { ExternalLink } from 'lucide-react';
import { normalizeExternalUrl, hostnameOf } from '../../lib/url';
import styles from './PageHeader.module.css';

export default function PageHeader({ title, subtitle, link }) {
  return (
    <div className={styles.banner}>
      <div className={`container ${styles.inner}`}>
        <h1 className={styles.title}>{title}</h1>
        {link && (
          <a href={normalizeExternalUrl(link)} target="_blank" rel="noreferrer" className={styles.link}>
            <ExternalLink size={13} /> {hostnameOf(link)}
          </a>
        )}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
}
