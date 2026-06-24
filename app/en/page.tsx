import type { Metadata } from "next";
import { Home } from "@/components/site/home";

export const metadata: Metadata = {
  title: "TRAVENCE | A New Standard in Travel",
  description:
    "Travel made safer, lighter, and smarter. Travence discovers and grows world-class travel brands for the Korean market.",
};

export default function Page() {
  return <Home lang="en" />;
}
