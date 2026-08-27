import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Modal, Button, TextInput, Select, Loader, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { MapPin, ClipboardList } from 'lucide-react';
import PageHeader from '../components/PageHeader/PageHeader';
import { eventsStore, eventoInscricoesStore } from '../lib/stores';
import { formatFullEventDate } from '../lib/eventDate';
import styles from './EventoDetalhePage.module.css';

const PERFIL_OPTIONS = ['Síndico', 'Conselheiro(a)', 'Administradora', 'Prestador(a) de Serviços'];

export default function EventoDetalhePage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    eventsStore.get(id)
      .then((data) => setEvent(data))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [id]);

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { perfil: PERFIL_OPTIONS[0] },
  });

  const onSubmit = async (values) => {
    try {
      await eventoInscricoesStore.create({ ...values, event_id: id, status: 'pendente' });
      notifications.show({ title: 'Inscrição enviada', message: 'Sua inscrição foi registrada com sucesso.', color: 'blue' });
      reset({ perfil: PERFIL_OPTIONS[0] });
      setFormOpen(false);
    } catch {
      notifications.show({ title: 'Erro ao enviar', message: 'Não foi possível registrar sua inscrição. Tente novamente.', color: 'red' });
    }
  };

  if (loading) {
    return <Group justify="center" py={100}><Loader color="blue" /></Group>;
  }

  if (!event) {
    return (
      <>
        <PageHeader title="Evento não encontrado" subtitle="Este evento pode ter sido removido." />
        <section className={`section ${styles.section}`}>
          <div className="container">
            <p className={styles.notFound}>
              <Link to="/eventos">← Voltar para todos os eventos</Link>
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title={event.title} subtitle={event.location || undefined} link={event.external_link || undefined} />
      <section className={`section ${styles.section}`}>
        <div className={`container ${styles.wrap}`}>
          {event.image_url && <img src={event.image_url} alt="" className={styles.cover} />}

          <div className={styles.meta}>
            {event.event_date && <span>{formatFullEventDate(event.event_date)}</span>}
            {event.location && <span><MapPin size={14} /> {event.location}</span>}
          </div>

          {event.description && <p className={styles.description}>{event.description}</p>}

          {event.allow_registration && (
            <div className={styles.actions}>
              <Button leftSection={<ClipboardList size={16} />} radius="xl" color="blue.7" onClick={() => setFormOpen(true)}>
                Ficha de Inscrição
              </Button>
            </div>
          )}

          <Link to="/eventos" className={styles.back}>← Voltar para todos os eventos</Link>
        </div>
      </section>

      <Modal opened={formOpen} onClose={() => setFormOpen(false)} title="Ficha de Inscrição" centered>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            label="Nome completo"
            mt="md"
            error={errors.nome_completo?.message}
            {...register('nome_completo', { required: 'Informe o nome completo' })}
          />
          <TextInput
            label="Condomínio"
            mt="md"
            error={errors.condominio?.message}
            {...register('condominio', { required: 'Informe o condomínio' })}
          />
          <Controller
            name="perfil"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                label="Perfil"
                mt="md"
                data={PERFIL_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                allowDeselect={false}
              />
            )}
          />
          <TextInput
            label="Telefone"
            mt="md"
            error={errors.telefone?.message}
            {...register('telefone', { required: 'Informe o telefone' })}
          />
          <TextInput
            label="E-mail"
            mt="md"
            error={errors.email?.message}
            {...register('email', { required: 'Informe o e-mail' })}
          />
          <Button type="submit" mt="lg" fullWidth radius="xl" color="blue.7" loading={isSubmitting}>
            Enviar inscrição
          </Button>
        </form>
      </Modal>
    </>
  );
}
