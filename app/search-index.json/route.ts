import { searchDeep } from '@/lib/search-deep';

/* The pages' own words, for the search palette to fetch when it first opens.
   Built once at build time and served as a file: nothing in it depends on the
   request. */
export const dynamic = 'force-static';

export function GET() {
  return Response.json(searchDeep);
}
