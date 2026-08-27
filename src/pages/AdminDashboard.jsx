import { useState } from 'react';
import { Drawer, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Newspaper, CalendarDays, FileText, Users, Handshake, UserPlus, ClipboardList } from 'lucide-react';
import CrudManager from '../admin/CrudManager';
import AffiliationsManager from '../admin/AffiliationsManager';
import RegistrationsManager from '../admin/RegistrationsManager';
import { newsAdminStore, eventsAdminStore, documentsStore, boardStore, partnersStore } from '../lib/stores';
import styles from './AdminDashboard.module.css';

const NAV_ITEMS = [
  { key: 'news', label: 'Notícias', icon: Newspaper },
  { key: 'events', label: 'Eventos', icon: CalendarDays },
  { key: 'documents', label: 'Documentos', icon: FileText },
  { key: 'board', label: 'Diretoria', icon: Users },
  { key: 'partners', label: 'Parceiros', icon: Handshake },
  { key: 'affiliations', label: 'Associações', icon: UserPlus },
  { key: 'registrations', label: 'Inscrições', icon: ClipboardList },
];

function Panel({ tab }) {
  switch (tab) {
    case 'news':
      return (
        <CrudManager
          key="news"
          store={newsAdminStore}
          title="Notícias"
          fields={[
            { name: 'title', label: 'Título' },
            { name: 'subtitle', label: 'Subtítulo / Resumo' },
            { name: 'category', label: 'Categoria (ex: curso, noticia)' },
            { name: 'aula', label: 'Rótulo (ex: Aula 01) — opcional' },
            { name: 'image_url', label: 'Imagem de capa (opcional)', type: 'file', bucket: 'capas-noticias', aspect: 16 / 9 },
            { name: 'external_link', label: 'Link externo (opcional)' },
            { name: 'is_featured_popup', label: 'Destacar como pop-up no site', type: 'boolean', description: 'Apenas uma notícia pode estar em destaque por vez — marcar esta desmarca outra automaticamente. Se um evento também estiver em destaque, o evento tem prioridade de exibição.' },
          ]}
        />
      );
    case 'events':
      return (
        <CrudManager
          key="events"
          store={eventsAdminStore}
          title="Eventos"
          fields={[
            { name: 'title', label: 'Título do evento' },
            { name: 'location', label: 'Local' },
            { name: 'event_date', label: 'Data (AAAA-MM-DD)' },
            { name: 'description', label: 'Descrição', type: 'textarea' },
            { name: 'image_url', label: 'Foto do evento (opcional)', type: 'file', bucket: 'capas-eventos', aspect: 16 / 9 },
            { name: 'external_link', label: 'Link externo (opcional)' },
            { name: 'is_featured_popup', label: 'Destacar como pop-up no site', type: 'boolean', description: 'Apenas um evento pode estar em destaque por vez — marcar este desmarca outro automaticamente' },
            { name: 'allow_registration', label: 'Permitir inscrição neste evento', type: 'boolean' },
          ]}
        />
      );
    case 'documents':
      return (
        <CrudManager
          key="documents"
          store={documentsStore}
          title="Documentos"
          fields={[
            { name: 'title', label: 'Título do documento' },
            { name: 'description', label: 'Descrição', type: 'textarea' },
            { name: 'file_url', label: 'Arquivo', type: 'file', bucket: 'documentos', aspect: 4 / 3 },
          ]}
        />
      );
    case 'board':
      return (
        <CrudManager
          key="board"
          store={boardStore}
          title="Diretoria"
          fields={[
            { name: 'name', label: 'Nome completo' },
            { name: 'role', label: 'Cargo' },
            { name: 'display_order', label: 'Ordem de exibição (número)' },
            { name: 'photo_url', label: 'Foto (opcional)', type: 'file', bucket: 'fotos-diretoria', aspect: 1 },
          ]}
        />
      );
    case 'partners':
      return (
        <CrudManager
          key="partners"
          store={partnersStore}
          title="Parceiros"
          fields={[
            { name: 'name', label: 'Nome do parceiro' },
            { name: 'logo_url', label: 'Logo (opcional)', type: 'file', bucket: 'logos-parceiros', aspect: 16 / 9 },
          ]}
        />
      );
    case 'affiliations':
      return <AffiliationsManager />;
    case 'registrations':
      return <RegistrationsManager />;
    default:
      return null;
  }
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('news');
  const [opened, { open, close }] = useDisclosure(false);

  const activeLabel = NAV_ITEMS.find((i) => i.key === tab)?.label;

  const selectTab = (key) => { setTab(key); close(); };

  return (
    <div>
      <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, marginBottom: 20 }}>Painel administrativo</h1>

      <div className={styles.mobileBar}>
        <span style={{ fontWeight: 700, color: 'var(--blue-deep)' }}>{activeLabel}</span>
        <Burger opened={opened} onClick={open} aria-label="Menu" />
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`${styles.navItem} ${tab === item.key ? styles.navItemActive : ''}`}
              onClick={() => setTab(item.key)}
            >
              <item.icon size={19} />
              {item.label}
            </button>
          ))}
        </aside>

        <div className={styles.content}>
          <Panel tab={tab} />
        </div>
      </div>

      <Drawer opened={opened} onClose={close} position="left" size="80%" title="Menu">
        <div className={styles.drawerNav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`${styles.drawerItem} ${tab === item.key ? styles.drawerItemActive : ''}`}
              onClick={() => selectTab(item.key)}
            >
              <item.icon size={17} />
              {item.label}
            </button>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
