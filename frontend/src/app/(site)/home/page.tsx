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
      <Hero />
      <Listening16 />
      <EpisodesStar />
      <EndEpisodes />
      <Sponsors />
      <ShortVideos />
      <JoinCommunitySection />
      <Footer />
    </div>
  );
}
