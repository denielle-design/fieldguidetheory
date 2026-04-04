// Species image proxy — Netlify Edge Function
// Hardcoded Wikimedia Commons filenames — no SPARQL, no P18 failures.
// All filenames verified from Wikidata item pages in search results.

const SPECIES_FILES = {
// Birds — all verified from Wikidata search results
‘Q44023’:    ‘Lilac-breasted_Roller_(Coracias_caudatus)*-*Etosha_2014.jpg’,
‘Q217497’:   ’Haliaeetus_vocifer*-Malawi*-perching_in_tree-8b.jpg’,
‘Q742259’:   ‘Fork-tailed_Drongo,*Dicrurus_adsimilis,*at_Marakele_National_Park,*Limpopo,*South_Africa*(45863627405).jpg’,
‘Q685074’:   ’Southern_Ground_Hornbill*(Bucorvus_leadbeateri)*male,*Kruger_NP*(51889201069).jpg’,
‘Q838793’:   ’Woodland_Kingfisher*(Halcyon_senegalensis)*(11431606894).jpg’,
‘Q1065365’:  ’Yellow-billed_hornbill*(Tockus_leucomelas)*(16075467296).jpg’,
‘Q281874’:   ‘2012-white-backed-vulture.jpg’,
‘Q838162’:   ’Lappet-faced_Vulture*(Torgos_tracheliotos),*Kgalagadi,*South_Africa*(6526355327).jpg’,
‘Q726387’:   ’Bateleur*(Terathopius_ecaudatus)*-*Flickr*-*Lip_Kee.jpg’,
‘Q19696068’: ‘Secretary-Bird.jpg’,
// Mammals — filenames from Wikidata Q-page search results
‘Q159918’:   ‘White_rhinoceros_africa.jpg’,
‘Q95036’:    ’Black_rhinoceros*(Diceros_bicornis)*(6028258605).jpg’,
‘Q36557’:    ‘178_Male_African_bush_elephant_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg’,
‘Q140’:      ‘Lion_waiting_in_Namibia.jpg’,
‘Q15083’:    ‘Rothschild's_giraffe_(Giraffa_camelopardalis_rothschildi)_-*Murchison_Falls_National_Park.jpg’,
‘Q160042’:   ’African_buffalo*(Syncerus_caffer)*Kruger.jpg’,
// Reptiles — filenames from Wikidata search results
‘Q369667’:   ‘Bitis_arietans_2010.JPG’,
‘Q188690’:   ‘Dendroaspis_polylepis_by_Bill_Love.jpg’,
‘Q18373235’: ’Naja_mossambica*-_Mozambique_spitting_cobra.jpg’,
‘Q737896’:   ‘Nile_Monitor,_Lake_Manyara.jpg’,
‘Q12266253’: ‘Geochelone_pardalis_bw_01.jpg’,
‘Q168745’:   ‘Crocodylus_niloticus6.jpg’,
};

const COMMONS_BASE = ‘https://commons.wikimedia.org/wiki/Special:FilePath/’;

export default async (req) => {
const url = new URL(req.url);
const qid = url.searchParams.get(‘q’);

if (!qid) {
return new Response(‘Missing q parameter’, { status: 400 });
}

const filename = SPECIES_FILES[qid];
if (!filename) {
return new Response(‘Species not found’, { status: 404 });
}

try {
const commonsUrl = COMMONS_BASE + encodeURIComponent(filename) + ‘?width=400’;
const imageRes = await fetch(commonsUrl, {
headers: { ‘User-Agent’: ‘FieldGuideWorkbook/1.0 (https://dhicksfieldguidetheory.netlify.app)’ },
redirect: ‘follow’,
});

```
if (!imageRes.ok) {
  return new Response('Image fetch failed: ' + imageRes.status, { status: 502 });
}

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

export const config = {
path: ‘/api/species-image’,
};