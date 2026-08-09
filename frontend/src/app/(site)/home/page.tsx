import EndEpisodes from "@/components/home/EndEpisodes";
import EpisodesStar from "@/components/home/EpisodesStar";
import Footer from "@/components/home/Footer";
import Hero from "@/components/home/Hero";
import JoinCommunitySection from "@/components/home/JoinCommunitySection";
import Listening16 from "@/components/home/Listening16";
import Navbar from "@/components/home/Navbar";
import ShortVideos from "@/components/home/ShortVideos";
import Sponsors from "@/components/home/Sponsors";

export default function Home() {
  return (
    <div className="bg-black">
      <Navbar />

      <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
        <Hero />
      </div>
      <div className="animate-fade-up" style={{ animationDelay: "130ms" }}>
        <Listening16 />
      </div>
      <div className="animate-fade-up" style={{ animationDelay: "260ms" }}>
        <EpisodesStar />
      </div>
      <div className="animate-fade-up" style={{ animationDelay: "390ms" }}>
        <EndEpisodes />
      </div>
      <div className="animate-fade-up" style={{ animationDelay: "520ms" }}>
        <Sponsors />
      </div>
      <div className="animate-fade-up" style={{ animationDelay: "650ms" }}>
        <ShortVideos />
      </div>
      <div className="animate-fade-up" style={{ animationDelay: "780ms" }}>
        <JoinCommunitySection />
      </div>

      <Footer />
    </div>
  );
}
