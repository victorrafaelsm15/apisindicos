import { useState } from 'react';
import { FileInput, Text, Group, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Paperclip, CheckCircle2 } from 'lucide-react';
import { uploadFile } from '../lib/uploadFile';

/**
 * Campo de upload real para o Supabase Storage.
 * Faz upload assim que um arquivo é selecionado e devolve a URL pública via onChange.
 */
export default function FileUploadField({ label, bucket, value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handlePick = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(bucket, file);
      onChange(url);
      notifications.show({ message: 'Arquivo enviado com sucesso.', color: 'blue' });
    } catch (err) {
      notifications.show({ title: 'Falha no upload', message: err.message || 'Não foi possível enviar o arquivo.', color: 'red' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <FileInput
        label={label}
        placeholder="Selecionar arquivo…"
        leftSection={uploading ? <Loader size={14} /> : <Paperclip size={15} />}
        disabled={uploading}
        onChange={handlePick}
      />
      {value && (
        <Group gap={6} mt={6}>
          <CheckCircle2 size={13} color="var(--blue, #1958c9)" />
          <Text size="xs" c="dimmed" truncate="end" style={{ maxWidth: 320 }}>
            Arquivo atual: <a href={value} target="_blank" rel="noreferrer">{value}</a>
          </Text>
        </Group>
      )}
    </div>
  );
}
