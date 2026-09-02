import { useEffect, useMemo, useState } from 'react';
import { Table, Loader, Group, Select, ActionIcon, Tooltip, Checkbox, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Download, Trash2, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import { eventoInscricoesStore, eventsStore } from '../lib/stores';
import { siteInfo } from '../data/siteContent';

function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('pt-BR'); } catch { return '—'; }
}

function drawRegistrationPage(doc, item, eventTitle) {
  doc.setFont(undefined, 'bold');
  doc.setFontSize(16);
  doc.setTextColor(8, 36, 82);
  doc.text(siteInfo.shortName + ' — Associação Piauiense de Síndicos', 14, 20);

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(91, 107, 140);
  doc.text(siteInfo.fullName, 14, 27);
  doc.text(siteInfo.address, 14, 33, { maxWidth: 180 });

  doc.setDrawColor(226, 233, 245);
  doc.line(14, 44, 196, 44);

  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 27, 51);
  doc.text('Inscrição em Evento', 14, 55);

  const rows = [
    ['Evento', eventTitle || '—'],
    ['Nome completo', item.nome_completo],
    ['Condomínio', item.condominio || '—'],
    ['Perfil', item.perfil],
    ['Telefone', item.telefone],
    ['E-mail', item.email],
    ['Data da inscrição', formatDate(item.created_at)],
  ];

  let y = 68;
  doc.setFontSize(11);
  rows.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 27, 51);
    doc.text(`${label}:`, 14, y);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(String(value ?? '—'), 65, y, { maxWidth: 130 });
    y += 10;
  });
}

function downloadPdf(item, eventTitle) {
  const doc = new jsPDF();
  drawRegistrationPage(doc, item, eventTitle);
  const fileName = `inscricao-${(item.nome_completo || 'inscricao').trim().replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(fileName);
}

function downloadBulkPdf(items, eventTitleById) {
  const doc = new jsPDF();
  items.forEach((item, index) => {
    if (index > 0) doc.addPage();
    drawRegistrationPage(doc, item, eventTitleById[item.event_id]);
  });
  doc.save(`inscricoes-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export default function RegistrationsManager() {
  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventFilter, setEventFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());

  const load = () => {
    setLoading(true);
    Promise.all([eventoInscricoesStore.list(), eventsStore.list()])
      .then(([regs, evts]) => { setItems(regs || []); setEvents(evts || []); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (item) => {
    if (!window.confirm(`Excluir a inscrição de "${item.nome_completo}"? Esta ação não pode ser desfeita.`)) return;
    await eventoInscricoesStore.remove(item.id);
    notifications.show({ message: 'Inscrição excluída.', color: 'gray' });
    load();
  };

  const eventTitleById = useMemo(() => {
    const map = {};
    events.forEach((e) => { map[e.id] = e.title; });
    return map;
  }, [events]);

  const filtered = eventFilter === 'all' ? items : items.filter((i) => i.event_id === eventFilter);
  const eventOptions = [
    { value: 'all', label: 'Todos os eventos' },
    ...events.map((e) => ({ value: e.id, label: e.title })),
  ];

  const handleFilterChange = (value) => {
    setEventFilter(value);
    setSelected(new Set());
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allSelected = filtered.length > 0 && filtered.every((i) => selected.has(i.id));
  const someSelected = filtered.some((i) => selected.has(i.id));

  const toggleAll = () => {
    setSelected((prev) => {
      if (allSelected) {
        const next = new Set(prev);
        filtered.forEach((i) => next.delete(i.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((i) => next.add(i.id));
      return next;
    });
  };

  const selectedItems = filtered.filter((i) => selected.has(i.id));

  if (loading) return <Group justify="center" py={40}><Loader color="blue" /></Group>;

  return (
    <div>
      <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
        <span style={{ fontWeight: 700 }}>Inscrições em Eventos</span>
        <Select data={eventOptions} value={eventFilter} onChange={handleFilterChange} allowDeselect={false} w={240} />
      </Group>

      {filtered.length ? (
        <>
          <Group justify="flex-end" mb="sm" gap="sm" wrap="wrap">
            <Button
              variant="light"
              size="xs"
              leftSection={<FileDown size={15} />}
              disabled={!selectedItems.length}
              onClick={() => downloadBulkPdf(selectedItems, eventTitleById)}
            >
              Exportar selecionados{selectedItems.length ? ` (${selectedItems.length})` : ''}
            </Button>
            <Button
              variant="filled"
              color="blue"
              size="xs"
              leftSection={<FileDown size={15} />}
              onClick={() => downloadBulkPdf(filtered, eventTitleById)}
            >
              Exportar todos ({filtered.length})
            </Button>
          </Group>

          <Table.ScrollContainer minWidth={940}>
            <Table verticalSpacing="sm" withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 36 }}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected && !allSelected}
                      onChange={toggleAll}
                      aria-label="Selecionar todos"
                    />
                  </Table.Th>
                  <Table.Th>Evento</Table.Th>
                  <Table.Th>Nome</Table.Th>
                  <Table.Th>Condomínio</Table.Th>
                  <Table.Th>Perfil</Table.Th>
                  <Table.Th>Telefone</Table.Th>
                  <Table.Th>E-mail</Table.Th>
                  <Table.Th>Data</Table.Th>
                  <Table.Th style={{ width: 76 }}></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((item) => (
                  <Table.Tr key={item.id} bg={selected.has(item.id) ? 'var(--bg-soft)' : undefined}>
                    <Table.Td>
                      <Checkbox
                        checked={selected.has(item.id)}
                        onChange={() => toggleOne(item.id)}
                        aria-label={`Selecionar ${item.nome_completo}`}
                      />
                    </Table.Td>
                    <Table.Td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{eventTitleById[item.event_id] || '—'}</Table.Td>
                    <Table.Td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{item.nome_completo}</Table.Td>
                    <Table.Td style={{ color: '#888', fontSize: 13, whiteSpace: 'nowrap' }}>{item.condominio || '—'}</Table.Td>
                    <Table.Td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{item.perfil}</Table.Td>
                    <Table.Td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{item.telefone}</Table.Td>
                    <Table.Td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{item.email}</Table.Td>
                    <Table.Td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{formatDate(item.created_at)}</Table.Td>
                    <Table.Td>
                      <Group gap={6} wrap="nowrap">
                        <Tooltip label="Baixar PDF">
                          <ActionIcon variant="subtle" color="blue" onClick={() => downloadPdf(item, eventTitleById[item.event_id])}><Download size={15} /></ActionIcon>
                        </Tooltip>
                        <Tooltip label="Excluir">
                          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item)}><Trash2 size={15} /></ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </>
      ) : (
        <p style={{ color: '#888', textAlign: 'center', padding: '30px 0' }}>Nenhuma inscrição recebida ainda.</p>
      )}
    </div>
  );
}
