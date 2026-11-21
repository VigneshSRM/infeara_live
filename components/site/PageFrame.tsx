import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SkipLink } from "@/components/site/SkipLink";

export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
