/**
 * Illustrated tiles used when a menu item has no photo. Ported from the
 * prototype so the menu has character before real photos are uploaded.
 * Keyed by category name; unknown categories get a soft brand mark.
 */
const BG: Record<string, string> = {
  Cookies: "#FDEBD0",
  "Chocolate Barks": "#ECD3C0",
  Tiramisu: "#EAE0F5",
  "Mono Cheesecakes": "#F7D6E0",
  Cheesecakes: "#D8EDD8",
  "Tea Cakes": "#FBE7CF",
};

const MOTIF: Record<string, string> = {
  Cookies:
    "<circle cx='200' cy='155' r='95' fill='#CA9B62'/><circle cx='200' cy='155' r='95' fill='none' stroke='#B07F44' stroke-width='5'/><g fill='#583726'><circle cx='168' cy='122' r='11'/><circle cx='228' cy='132' r='10'/><circle cx='196' cy='168' r='12'/><circle cx='158' cy='180' r='9'/><circle cx='238' cy='182' r='10'/><circle cx='212' cy='108' r='8'/></g>",
  "Chocolate Barks":
    "<g transform='rotate(-8 200 150)'><rect x='118' y='92' width='164' height='120' rx='12' fill='#6B4423'/><g stroke='#4E3018' stroke-width='5'><line x1='159' y1='92' x2='159' y2='212'/><line x1='200' y1='92' x2='200' y2='212'/><line x1='241' y1='92' x2='241' y2='212'/><line x1='118' y1='152' x2='282' y2='152'/></g><circle cx='150' cy='86' r='11' fill='#A7C957'/><circle cx='250' cy='84' r='9' fill='#C98A52'/></g>",
  Tiramisu:
    "<rect x='118' y='108' width='164' height='100' rx='12' fill='#F3E2C4'/><rect x='118' y='134' width='164' height='18' fill='#6B4A33'/><rect x='118' y='176' width='164' height='14' fill='#6B4A33'/><g fill='#543726' opacity='0.55'><circle cx='150' cy='124' r='3'/><circle cx='182' cy='121' r='3'/><circle cx='220' cy='125' r='3'/><circle cx='252' cy='122' r='3'/></g>",
  "Mono Cheesecakes":
    "<circle cx='200' cy='152' r='90' fill='#F4E7C8'/><circle cx='200' cy='152' r='90' fill='none' stroke='#E3CFA0' stroke-width='6'/><circle cx='200' cy='152' r='46' fill='#D98A4A'/><circle cx='200' cy='152' r='46' fill='none' stroke='#C2722F' stroke-width='4'/>",
  Cheesecakes:
    "<polygon points='150,205 250,205 215,108' fill='#F4E7C8'/><polygon points='150,205 250,205 215,108' fill='none' stroke='#E3CFA0' stroke-width='4'/><rect x='146' y='200' width='108' height='24' rx='4' fill='#C89B6B'/><circle cx='208' cy='124' r='12' fill='#B83A56'/>",
  "Tea Cakes":
    "<rect x='112' y='128' width='176' height='86' rx='30' fill='#E2B26F'/><rect x='112' y='128' width='176' height='30' rx='15' fill='#EEC489'/><g fill='#ffffff' opacity='0.6'><circle cx='160' cy='124' r='3.5'/><circle cx='200' cy='119' r='3.5'/><circle cx='240' cy='125' r='3.5'/></g>",
};

const cache = new Map<string, string>();

export function categoryArt(category: string | null | undefined): string {
  const key = category ?? "";
  const hit = cache.get(key);
  if (hit) return hit;
  const bg = BG[key] ?? "#F5EEE6";
  const motif = MOTIF[key] ?? "<circle cx='200' cy='150' r='80' fill='#D4829E' opacity='0.5'/>";
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>" +
    "<defs><radialGradient id='w' cx='50%' cy='32%' r='82%'><stop offset='0%' stop-color='#ffffff' stop-opacity='0.6'/><stop offset='100%' stop-color='" +
    bg +
    "'/></radialGradient></defs>" +
    "<rect width='400' height='300' fill='" +
    bg +
    "'/><rect width='400' height='300' fill='url(#w)'/>" +
    "<ellipse cx='200' cy='238' rx='114' ry='20' fill='#3a2a2a' opacity='0.09'/>" +
    motif +
    "</svg>";
  const url = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  cache.set(key, url);
  return url;
}
