import { useEffect, useState } from 'react';
import { Button, TextInput, Textarea, Table, ActionIcon, Modal, Loader, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Plus, Trash2, Pencil, Paperclip } from 'lucide-react';
import FileUploadField from './FileUploadField';

/**
 * Gerenciador CRUD genérico e reutilizável.
 * fields: [{ name, label, type: 'text'|'textarea'|'file', bucket? }] — bucket é obrigatório quando type === 'file'.
 */
export default function CrudManager({ store, fields, title, emptyLabel }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    store.list().then((data) => { setItems(data); setLoading(false); });
  };
  useEffect(load, []); // eslint-disable-line

  const openNew = () => { setEditing(null); setForm({}); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm(item); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    if (editing) await store.update(editing.id, form);
    else await store.create(form);
    setSaving(false);
    setModalOpen(false);
    notifications.show({ message: 'Salvo com sucesso.', color: 'blue' });
    load();
  };

  const handleDelete = async (id) => {
    await store.remove(id);
    notifications.show({ message: 'Removido.', color: 'gray' });
    load();
  };

  const renderCell = (item, field) => {
    if (!field) return null;
    const value = item[field.name];
    if (field.type === 'file') {
      return value ? (
        <a href={value} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--blue, #1958c9)', fontWeight: 600 }}>
          <Paperclip size={13} /> Ver arquivo
        </a>
      ) : <span style={{ color: '#bbb' }}>—</span>;
    }
    return value;
  };

  if (loading) return <Group justify="center" py={40}><Loader color="blue" /></Group>;

  return (
    <div>
      <Group justify="space-between" mb="md">
        <span style={{ fontWeight: 700 }}>{title}</span>
        <Button size="xs" leftSection={<Plus size={14} />} color="blue.7" onClick={openNew}>Novo</Button>
      </Group>

      {items.length ? (
        <Table verticalSpacing="sm" withTableBorder>
          <Table.Tbody>
            {items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td style={{ fontWeight: 600 }}>{renderCell(item, fields[0])}</Table.Td>
                <Table.Td style={{ color: '#888', fontSize: 13 }}>{renderCell(item, fields[1])}</Table.Td>
                <Table.Td style={{ width: 90 }}>
                  <Group gap={6}>
                    <ActionIcon variant="subtle" color="gray" onClick={() => openEdit(item)}><Pencil size={15} /></ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item.id)}><Trash2 size={15} /></ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <p style={{ color: '#888', textAlign: 'center', padding: '30px 0' }}>{emptyLabel || 'Nenhum item cadastrado ainda.'}</p>
      )}

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar' : 'Novo item'}>
        {fields.map((f) => {
          if (f.type === 'file') {
            return (
              <FileUploadField
                key={f.name}
                label={f.label}
                bucket={f.bucket}
                value={form[f.name] || ''}
                onChange={(url) => setForm({ ...form, [f.name]: url })}
              />
            );
          }
          if (f.type === 'textarea') {
            return (
              <Textarea
                key={f.name}
                label={f.label}
                mb="sm"
                value={form[f.name] || ''}
                onChange={(e) => setForm({ ...form, [f.name]: e.currentTarget.value })}
              />
            );
          }
          return (
            <TextInput
              key={f.name}
              label={f.label}
              mb="sm"
              value={form[f.name] || ''}
              onChange={(e) => setForm({ ...form, [f.name]: e.currentTarget.value })}
            />
          );
        })}
        <Button fullWidth mt="sm" color="blue.7" onClick={handleSave} loading={saving}>Salvar</Button>
      </Modal>
    </div>
  );
}
