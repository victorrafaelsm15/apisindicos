import Hero from '../components/Hero/Hero';
import About from '../components/About/About';
import Objectives from '../components/About/Objectives';
import News from '../components/News/News';
import Events from '../components/Events/Events';
import Membership from '../components/Membership/Membership';
import Board from '../components/Board/Board';
import Partners from '../components/Partners/Partners';
import Documents from '../components/Documents/Documents';
import Contact from '../components/Contact/Contact';
import FeaturedPopup from '../components/FeaturedPopup/FeaturedPopup';

export default function Home() {
  return (
    <>
      <FeaturedPopup />
      <Hero />
      <About />
      <Objectives />
      <News />
      <Events />
      <Membership />
      <Board />
      <Partners />
      <Documents />
      <Contact />
    </>
  );
}
