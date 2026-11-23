import CustomStudio from '../components/sections/CustomStudio';
import FAQ from '../components/sections/FAQ';
import useSeo from '../hooks/useSeo';

export default function Custom() {
  useSeo('Custom Stickers', 'Upload your artwork, add text and order custom die-cut vinyl stickers from STIKLY.');
  return <><CustomStudio standalone /><FAQ /></>;
}
