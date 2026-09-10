import Hero from "@/components/sections/Hero";
import Intro from "@/components/sections/Intro";
import Benefits from "@/components/sections/Benefits";
import Open from "@/components/sections/Open";
import Product from "@/components/sections/Product";
import Cancer from "@/components/sections/Cancer";
import Report from "@/components/sections/Report";
import Structure from "@/components/sections/Structure";
import Earnings from "@/components/sections/Earnings";
import Family from "@/components/sections/Family";
import Anytime from "@/components/sections/Anytime";
import WinWin from "@/components/sections/WinWin";
import ApplyForm from "@/components/sections/ApplyForm";
import Marketing from "@/components/sections/Marketing";
import NewsPreview from "@/components/sections/NewsPreview";
import CtaBanner from "@/components/sections/CtaBanner";

export const revalidate = 1800;

export default function Home() {
  return (
    <main>
      <Hero />
      <Intro />
      <Benefits />
      <Open />
      <Product />
      <Cancer />
      <Report />
      <Structure />
      <Earnings />
      <Family />
      <Anytime />
      <WinWin />
      <ApplyForm />
      <Marketing />
      <NewsPreview />
      <CtaBanner />
    </main>
  );
}
