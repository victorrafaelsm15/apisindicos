import { useState } from 'react';
import { FileInput, Text, Group, Loader, Modal, Slider, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Paperclip, CheckCircle2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { uploadFile } from '../lib/uploadFile';
import { getCroppedImageBlob } from '../lib/cropImage';

/**
 * Campo de upload real para o Supabase Storage.
 * Se o arquivo escolhido for uma imagem, abre um recorte (zoom/posição)
 * antes de enviar; outros tipos de arquivo (ex: PDF) são enviados direto.
 */
export default function FileUploadField({ label, bucket, value, onChange, aspect = 1 }) {
  const [uploading, setUploading] = useState(false);
  const [cropFile, setCropFile] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const doUpload = async (file) => {
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

  const closeCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCropFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handlePick = (file) => {
    if (!file) return;
    if (file.type.startsWith('image/')) {
      setCropFile(file);
      setCropSrc(URL.createObjectURL(file));
    } else {
      doUpload(file);
    }
  };

  const handleConfirmCrop = async () => {
    if (!croppedAreaPixels || !cropFile) return;
    try {
      const mimeType = cropFile.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const blob = await getCroppedImageBlob(cropSrc, croppedAreaPixels, mimeType);
      const ext = mimeType === 'image/png' ? 'png' : 'jpg';
      const croppedFile = new File([blob], `recorte.${ext}`, { type: mimeType });
      closeCrop();
      await doUpload(croppedFile);
    } catch {
      notifications.show({ title: 'Falha no recorte', message: 'Não foi possível processar a imagem.', color: 'red' });
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

      <Modal opened={!!cropSrc} onClose={closeCrop} title="Ajustar enquadramento" size="md" centered>
        <div style={{ position: 'relative', width: '100%', height: 320, background: '#1a1a1a', borderRadius: 8, overflow: 'hidden' }}>
          {cropSrc && (
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={aspect === 1 ? 'round' : 'rect'}
              showGrid={aspect !== 1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
            />
          )}
        </div>
        <Text size="xs" c="dimmed" mt="md" mb={4}>Zoom</Text>
        <Slider min={1} max={3} step={0.02} value={zoom} onChange={setZoom} label={(v) => `${v.toFixed(1)}x`} />
        <Group mt="lg" grow>
          <Button variant="default" onClick={closeCrop} disabled={uploading}>Cancelar</Button>
          <Button color="blue.7" onClick={handleConfirmCrop} loading={uploading}>Confirmar e enviar</Button>
        </Group>
      </Modal>
    </div>
  );
}
