// Species image proxy — Netlify Edge Function
// Uses Wikimedia Commons imageinfo API — handles all filenames correctly.

const SPECIES_FILES = {
‘Q44023’:    ‘Lilac-breasted Roller (Coracias caudatus) - Etosha 2014.jpg’,
‘Q217497’:   ‘Haliaeetus vocifer -Malawi -perching in tree-8b.jpg’,
‘Q742259’:   ‘Fork-tailed Drongo, Dicrurus adsimilis, at Marakele National Park, Limpopo, South Africa (45863627405).jpg’,
‘Q685074’:   ‘Southern Ground Hornbill (Bucorvus leadbeateri) male, Kruger NP (51889201069).jpg’,
‘Q838793’:   ‘Woodland Kingfisher (Halcyon senegalensis) (11431606894).jpg’,
‘Q1065365’:  ‘Yellow-billed hornbill (Tockus leucomelas) (16075467296).jpg’,
‘Q281874’:   ‘2012-white-backed-vulture.jpg’,
‘Q838162’:   ‘Lappet-faced Vulture (Torgos tracheliotos), Kgalagadi, South Africa (6526355327).jpg’,
‘Q726387’:   ‘Bateleur (Terathopius ecaudatus) - Flickr - Lip Kee.jpg’,
‘Q19696068’: ‘Secretary-Bird.jpg’,
‘Q159918’:   ‘White rhinoceros africa.jpg’,
‘Q95036’:    ‘Black rhinoceros (Diceros bicornis) (6028258605).jpg’,
‘Q36557’:    ‘178 Male African bush elephant in Etosha National Park Photo by Giles Laurent.jpg’,
‘Q140’:      ‘Lion waiting in Namibia.jpg’,
‘Q15083’:    ‘Giraffe camelopardalis reticulata Laikipia.jpg’,
‘Q160042’:   ‘Syncerus caffer - Kruger National Park.jpg’,
‘Q369667’:   ‘Bitis arietans 2010.JPG’,
‘Q188690’:   ‘Dendroaspis polylepis by Bill Love.jpg’,
‘Q18373235’: ‘Naja mossambica - Mozambique spitting cobra.jpg’,
‘Q737896’:   ‘Nile Monitor, Lake Manyara.jpg’,
‘Q12266253’: ‘Geochelone pardalis bw 01.jpg’,
‘Q168745’:   ‘Crocodylus niloticus6.jpg’,
};

export default async (req) => {
const url = new URL(req.url);
const qid = url.searchParams.get(‘q’);

if (!qid) return new Response(‘Missing q parameter’, { status: 400 });

const filename = SPECIES_FILES[qid];
if (!filename) return new Response(‘Species not found’, { status: 404 });

try {
// Use Commons API — handles all special characters correctly
const apiUrl = ‘https://commons.wikimedia.org/w/api.php?action=query&titles=File:’
+ encodeURIComponent(filename)
+ ‘&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*’;

```
const apiRes = await fetch(apiUrl, {
  headers: { 'User-Agent': 'FieldGuideWorkbook/1.0' },
});

if (!apiRes.ok) return new Response('API error', { status: 502 });

const data = await apiRes.json();
const pages = data?.query?.pages;
const page = pages && Object.values(pages)[0];
const thumbUrl = page?.imageinfo?.[0]?.thumburl;

if (!thumbUrl) return new Response('No image found', { status: 404 });

// Fetch the actual image
const imageRes = await fetch(thumbUrl, {
  headers: { 'User-Agent': 'FieldGuideWorkbook/1.0' },
  redirect: 'follow',
});

if (!imageRes.ok) return new Response('Image fetch failed', { status: 502 });

const imageData = await imageRes.arrayBuffer();
const contentType = imageRes.headers.get('content-type') || 'image/jpeg';

return new Response(imageData, {
  status: 200,
  headers: {
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=86400',
  },
});
```

} catch (err) {
return new Response(’Error: ’ + err.message, { status: 500 });
}
};

export const config = { path: ‘/api/species-image’ };