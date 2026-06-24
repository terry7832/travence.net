import { Lang } from "@/lib/content";
import { SiteNav } from "@/components/site/site-nav";
import { ScrollExpand } from "@/components/site/scroll-expand";
import { About } from "@/components/site/about";
import { Brands } from "@/components/site/brands";
import { Business } from "@/components/site/business";
import { Channels } from "@/components/site/channels";
import { Careers } from "@/components/site/careers";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";

export function Home({ lang }: { lang: Lang }) {
  return (
    <>
      <SiteNav lang={lang} />
      <ScrollExpand lang={lang} />
      <About lang={lang} />
      <Business lang={lang} />
      <Brands lang={lang} />
      <Channels lang={lang} />
      <Careers lang={lang} />
      <Contact lang={lang} />
      <Footer lang={lang} />
    </>
  );
}
