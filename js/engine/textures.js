// Procedural checker + speckle texture, nearest-filtered.
export function makeTex(THREE, a, b, cell = 8, size = 32, seed = 1) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const g = cv.getContext('2d');
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    g.fillStyle = (((x / cell) | 0) + ((y / cell) | 0)) & 1 ? a : b;
    g.fillRect(x, y, 1, 1);
    if (rnd() < 0.18) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, y, 1, 1); }
  }
  const t = new THREE.CanvasTexture(cv);
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
