export default async (req) => {
  const url = new URL(req.url);
  const qid = url.searchParams.get('q');
  if (!qid || !/^Q\d+$/.test(qid)) return new Response('Bad request', { status: 400 });
  try {
    const sparql = `SELECT ?image WHERE { wd:${qid} wdt:P18 ?image . } LIMIT 1`;
    const sparqlRes = await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`, {
      headers: { 'Accept': 'application/sparql-results+json', 'User-Agent': 'FieldGuideWorkbook/1.0' }
    });
    const data = await sparqlRes.json();
    const fileUrl = data?.results?.bindings?.[0]?.image?.value;
    if (!fileUrl) return new Response('No image', { status: 404 });
    const imgRes = await fetch(fileUrl + '?width=400', { headers: { 'User-Agent': 'FieldGuideWorkbook/1.0' }, redirect: 'follow' });
    if (!imgRes.ok) return new Response('Image fetch failed', { status: 502 });
    return new Response(await imgRes.arrayBuffer(), {
      headers: { 'Content-Type': imgRes.headers.get('content-type') || 'image/jpeg', 'Cache-Control': 'public, max-age=86400' }
    });
  } catch (e) { return new Response('Error: ' + e.message, { status: 500 }); }
};
export const config = { path: '/api/species-image' };
