import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Workflow from '@/components/Workflow';
import MediaWall from '@/components/MediaWall';
import Cases from '@/components/Cases';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Faq from '@/components/Faq';
import CtaBanner from '@/components/CtaBanner';
import Footer from '@/components/Footer';

/* 章节顺序严格固定。id='product' 归 MediaWall，Features 不重复该 id。 */

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Workflow />
        <MediaWall />
        <Cases />
        <Features />
        <Pricing />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
