import { SiteNav } from "@/components/site/site-nav";
import { ScrollExpand } from "@/components/site/scroll-expand";
import { About } from "@/components/site/about";
import { Brands } from "@/components/site/brands";
import { Business } from "@/components/site/business";
import { Channels } from "@/components/site/channels";
import { Careers } from "@/components/site/careers";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";

export default function Home() {
  return (
    <>
      <SiteNav />
      <ScrollExpand />
      <About />
      <Brands />
      <Business />
      <Channels />
      <Careers />
      <Contact />
      <Footer />
    </>
  );
}
