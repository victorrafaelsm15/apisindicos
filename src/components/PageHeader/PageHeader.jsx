import styles from './PageHeader.module.css';

export default function PageHeader({ title, subtitle }) {
  return (
    <div className={styles.banner}>
      <div className={`container ${styles.inner}`}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
}
