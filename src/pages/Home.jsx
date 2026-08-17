import Hero from '../components/Hero/Hero';
import About from '../components/About/About';
import Objectives from '../components/About/Objectives';
import Membership from '../components/Membership/Membership';
import Board from '../components/Board/Board';
import Partners from '../components/Partners/Partners';
import Documents from '../components/Documents/Documents';
import Contact from '../components/Contact/Contact';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Objectives />
      <Membership />
      <Board />
      <Partners />
      <Documents />
      <Contact />
    </>
  );
}
