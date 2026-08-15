import PageHeader from '../components/PageHeader/PageHeader';
import About from '../components/About/About';
import Objectives from '../components/About/Objectives';

export default function Sobre() {
  return (
    <>
      <PageHeader title="Sobre a APIS" subtitle="Nossa missão, visão e valores." />
      <About />
      <Objectives />
    </>
  );
}
