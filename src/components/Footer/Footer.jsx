import { Link } from 'react-router-dom';
import { IconBrandInstagram } from '@tabler/icons-react';
import { siteInfo } from '../../data/siteContent';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandCol}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>A</span>
            <span>{siteInfo.shortName}</span>
          </div>
          <p>{siteInfo.fullName}</p>
        </div>

        <div className={styles.col}>
          <h4>Institucional</h4>
          <Link to="/sobre">Sobre</Link>
          <Link to="/diretoria">Diretoria</Link>
          <Link to="/documentos">Documentos</Link>
        </div>

        <div className={styles.col}>
          <h4>Comunidade</h4>
          <Link to="/cursos">Cursos</Link>
          <Link to="/filiacao">Filie-se</Link>
          <a href={siteInfo.instagramUrl} target="_blank" rel="noreferrer"><IconBrandInstagram size={14} style={{ display: 'inline', marginRight: 4 }} /> Instagram</a>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={`container ${styles.bottomInner}`}>
          <span>© {new Date().getFullYear()} {siteInfo.shortName} — Todos os direitos reservados.</span>
          <Link to="/admin/login" className={styles.adminLink}>Painel administrativo</Link>
        </div>
      </div>
    </footer>
  );
}
