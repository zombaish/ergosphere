// world = { bounds:{minX,maxX,minZ,maxZ}, boxes:[{minX,maxX,minZ,maxZ}] }
const hit = (p, r, b) => p.x > b.minX - r && p.x < b.maxX + r && p.z > b.minZ - r && p.z < b.maxZ + r;
export function moveCircle(p, dx, dz, r, w) {
  p.x += dx;
  for (const b of w.boxes) if (hit(p, r, b)) p.x = dx > 0 ? b.minX - r : b.maxX + r;
  p.z += dz;
  for (const b of w.boxes) if (hit(p, r, b)) p.z = dz > 0 ? b.minZ - r : b.maxZ + r;
  const B = w.bounds;
  p.x = Math.min(B.maxX - r, Math.max(B.minX + r, p.x));
  p.z = Math.min(B.maxZ - r, Math.max(B.minZ + r, p.z));
}
