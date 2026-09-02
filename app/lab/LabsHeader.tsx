import LabsNav from './LabsNav';
import { searchDefaults, searchIndex } from '@/lib/search-index';

/* The server half of the labs' header.

   All thirteen lab pages render this, and they render it the way they always
   did — the split exists so the search index can be read on the server. The
   index is built from protocol-pages and device-pages, which carry every
   page's prose; importing it from LabsNav, which is a Client Component, would
   put all of that back into the browser. */
export default function LabsHeader({ activeLab }: { activeLab?: string }) {
  return (
    <LabsNav activeLab={activeLab} searchEntries={searchIndex} searchDefaults={searchDefaults} />
  );
}
