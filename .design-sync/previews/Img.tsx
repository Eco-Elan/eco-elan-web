import { Img } from "nuueco";

// Deterministic, offline-safe sample image (a brand-green gradient tile) so the
// card renders identically without a network fetch. In real use, pass a photo URL.
const photo =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420'>
       <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
         <stop offset='0' stop-color='#6DC890'/><stop offset='1' stop-color='#2E7355'/>
       </linearGradient></defs>
       <rect width='640' height='420' fill='url(#g)'/>
       <text x='50%' y='53%' font-family='Plus Jakarta Sans, system-ui, sans-serif'
         font-size='40' font-weight='700' fill='#ffffff' text-anchor='middle'>Eco Elan</text>
     </svg>`,
  );

// `radius` rounds the corners; the wrapper fills its container with object-fit cover.
export function Rounded() {
  return (
    <div style={{ width: 340, height: 210, padding: 24 }}>
      <Img src={photo} alt="Spotless, freshly cleaned kitchen" radius={18} />
    </div>
  );
}

// Square crop — same image, no radius, demonstrating the cover fit.
export function Square() {
  return (
    <div style={{ width: 200, height: 200, padding: 24 }}>
      <Img src={photo} alt="Eco-friendly clean" />
    </div>
  );
}
