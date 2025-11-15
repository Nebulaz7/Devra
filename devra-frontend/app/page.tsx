import About from "./components/About";
import CtaCard from "./components/CtaCard";
import Hero from "./components/Hero";
import NavBar from "./components/Navbar";
import Tag from "./components/Tag";

export default function Home() {
  return (
    <div>
      <NavBar />
      <Tag />
      <Hero />
      <About />
      <CtaCard />
    </div>
  );
}
