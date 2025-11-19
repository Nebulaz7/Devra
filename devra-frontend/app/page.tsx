import About from "./components/About";
import CtaCard from "./components/CtaCard";
import Footer from "./components/Footer";
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
      <section className="bg-gradient-to-b from-transparent to-pink-500/20">
        <CtaCard />
      </section>
      <Footer />
    </div>
  );
}
