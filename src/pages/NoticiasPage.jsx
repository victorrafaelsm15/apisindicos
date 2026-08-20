import PageHeader from '../components/PageHeader/PageHeader';
import News from '../components/News/News';

export default function NoticiasPage() {
  return (
    <>
      <PageHeader title="Notícias" subtitle="Novidades e atualizações da APIS." />
      <News />
    </>
  );
}
