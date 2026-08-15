import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Drawer, Burger, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBrandInstagram } from '@tabler/icons-react';
import { ArrowUpRight } from 'lucide-react';
import { siteInfo } from '../../data/siteContent';
import styles from './Header.module.css';

const LINKS = [
  { to: '/', label: 'Início' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/cursos', label: 'Cursos' },
  { to: '/diretoria', label: 'Diretoria' },
  { to: '/documentos', label: 'Documentos' },
  { to: '/contato', label: 'Contato' },
];

export default function Header() {
  const [opened, { open, close }] = useDisclosure(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>A</span>
          <span className={styles.logoText}>
            {siteInfo.shortName}
            <span className={styles.logoSub}>Síndicos do Piauí</span>
          </span>
        </Link>

        <nav className={styles.nav}>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `${styles.navPill} ${isActive ? styles.navPillActive : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <a href={siteInfo.instagramUrl} target="_blank" rel="noreferrer" className={styles.iconLink} aria-label="Instagram">
            <IconBrandInstagram size={19} />
          </a>
          <Button
            component={Link}
            to="/filiacao"
            radius="xl"
            color="blue.7"
            rightSection={<ArrowUpRight size={15} />}
          >
            Inscreva-se
          </Button>
          <Burger opened={opened} onClick={open} className={styles.burger} aria-label="Menu" />
        </div>
      </div>

      <Drawer opened={opened} onClose={close} position="right" size="85%" title="Menu" padding="lg">
        <div className={styles.drawerNav}>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={close} className={styles.drawerLink}>{l.label}</NavLink>
          ))}
          <Button component={Link} to="/filiacao" onClick={close} fullWidth mt="md" radius="xl" color="blue.7">
            Inscreva-se
          </Button>
        </div>
      </Drawer>
    </header>
  );
}
