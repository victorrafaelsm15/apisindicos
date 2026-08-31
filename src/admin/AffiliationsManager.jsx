import { useEffect, useState } from 'react';
import { Table, Badge, ActionIcon, Loader, Group, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Download, Check, X } from 'lucide-react';
import jsPDF from 'jspdf';
import { filiacaoStore } from '../lib/stores';
import { siteInfo } from '../data/siteContent';

const STATUS_COLOR = { pendente: 'yellow', aprovado: 'green', rejeitado: 'red' };
const STATUS_LABEL = { pendente: 'Pendente', aprovado: 'Aprovado', rejeitado: 'Rejeitado' };

function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('pt-BR'); } catch { return '—'; }
}

function downloadPdf(item) {
  const doc = new jsPDF();

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
  doc.text('Solicitação de Associação', 14, 55);

  const rows = [
    ['Nome completo', item.nome_completo],
    ['CPF / CNPJ', item.cpf_cnpj],
    ['E-mail', item.email],
    ['Telefone', item.telefone],
    ['Condomínio', item.condominio || '—'],
    ['Categoria', item.categoria],
    ['Status', STATUS_LABEL[item.status] || item.status],
    ['Data da solicitação', formatDate(item.created_at)],
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

  const fileName = `associacao-${(item.nome_completo || 'solicitacao').trim().replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(fileName);
}

export default function AffiliationsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    filiacaoStore.list().then((data) => { setItems(data); setLoading(false); });
  };
  useEffect(load, []);

  const setStatus = async (item, status) => {
    await filiacaoStore.update(item.id, { status });
    notifications.show({ message: status === 'aprovado' ? 'Solicitação aprovada.' : 'Solicitação rejeitada.', color: status === 'aprovado' ? 'green' : 'red' });
    load();
  };

  if (loading) return <Group justify="center" py={40}><Loader color="blue" /></Group>;

  return (
    <div>
      <Group justify="space-between" mb="md">
        <span style={{ fontWeight: 700 }}>Solicitações de Associação</span>
      </Group>

      {items.length ? (
        <Table.ScrollContainer minWidth={760}>
          <Table verticalSpacing="sm" withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nome</Table.Th>
                <Table.Th>Condomínio</Table.Th>
                <Table.Th>Categoria</Table.Th>
                <Table.Th>Data</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th style={{ width: 140 }}>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{item.nome_completo}</Table.Td>
                  <Table.Td style={{ color: '#888', fontSize: 13, whiteSpace: 'nowrap' }}>{item.condominio || '—'}</Table.Td>
                  <Table.Td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{item.categoria}</Table.Td>
                  <Table.Td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{formatDate(item.created_at)}</Table.Td>
                  <Table.Td><Badge color={STATUS_COLOR[item.status] || 'gray'} variant="light">{STATUS_LABEL[item.status] || item.status}</Badge></Table.Td>
                  <Table.Td>
                    <Group gap={6} wrap="nowrap">
                      <Tooltip label="Baixar PDF">
                        <ActionIcon variant="subtle" color="blue" onClick={() => downloadPdf(item)}><Download size={15} /></ActionIcon>
                      </Tooltip>
                      {item.status !== 'aprovado' && (
                        <Tooltip label="Aprovar">
                          <ActionIcon variant="subtle" color="green" onClick={() => setStatus(item, 'aprovado')}><Check size={15} /></ActionIcon>
                        </Tooltip>
                      )}
                      {item.status !== 'rejeitado' && (
                        <Tooltip label="Rejeitar">
                          <ActionIcon variant="subtle" color="red" onClick={() => setStatus(item, 'rejeitado')}><X size={15} /></ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      ) : (
        <p style={{ color: '#888', textAlign: 'center', padding: '30px 0' }}>Nenhuma solicitação de associação recebida ainda.</p>
      )}
    </div>
  );
}
