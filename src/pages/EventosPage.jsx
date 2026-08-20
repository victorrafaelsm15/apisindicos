import PageHeader from '../components/PageHeader/PageHeader';
import Events from '../components/Events/Events';

export default function EventosPage() {
  return (
    <>
      <PageHeader title="Eventos" subtitle="Agenda de eventos da APIS." />
      <Events />
    </>
  );
}
