import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import { Route } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";

// OSM tile blocking: intercept tile requests for tiles fully inside the event
// site polygon and return a transparent tile instead of hitting the network.
// Tiles on the boundary are always fetched so edge rendering is correct.

const OUTLINE_POLYGON: [number, number][] = [
  [14.122594256740873, 55.9832688653325],
  [14.120509920343519, 55.97968291983854],
  [14.120696084093607, 55.97924858305241],
  [14.120696084093607, 55.97924858305241],
  [14.121407793686371, 55.97901550990149],
  [14.126361823553033, 55.97824922117022],
  [14.126724179137883, 55.97791131835541],
  [14.126724179137883, 55.97791131835541],
  [14.126742748980112, 55.97747154210229],
  [14.125707524229751, 55.976433280416224],
  [14.125888362264398, 55.97635312263548],
  [14.125888362264398, 55.97635312263548],
  [14.129241119252669, 55.97659172823318],
  [14.13245316651061, 55.97720879167157],
  [14.13355338257777, 55.97756676567885],
  [14.135650128711484, 55.9781354971357],
  [14.136143041706761, 55.978223860527315],
  [14.137258915019258, 55.97829764031049],
  [14.143017949000368, 55.97849784340603],
  [14.148189021929374, 55.97868098459496],
  [14.150208414191187, 55.97874989370907],
  [14.150323818657624, 55.97918582241558],
  [14.150498642934373, 55.97984112657058],
  [14.150629841544067, 55.98031200821662],
  [14.150925135109649, 55.98120056895212],
  [14.151198566228853, 55.9820939790405],
  [14.151457877806031, 55.982950532559876],
  [14.151651110342389, 55.983593427365655],
  [14.151739921161097, 55.983952793300446],
  [14.148149900958513, 55.9839158483873],
  [14.146825360925277, 55.98390007766773],
  [14.146653211380555, 55.98390855613051],
  [14.146703628979406, 55.983083511465594],
  [14.144676337631017, 55.98300985099459],
  [14.144371963835457, 55.983040323602594],
  [14.144383209462777, 55.98381817166387],
  [14.144383209462777, 55.98381817166387],
  [14.14441505970476, 55.983905123186595],
  [14.144434358230672, 55.984456138236354],
  [14.144276064061527, 55.984485373512406],
  [14.143869862247183, 55.984843542733486],
  [14.143171206292523, 55.98529035441018],
  [14.142916337575237, 55.9854448086181],
  [14.142916337575237, 55.9854448086181],
  [14.141652831443368, 55.98484628265722],
  [14.140518277052806, 55.98423802188199],
  [14.139448245040663, 55.98460247511419],
  [14.138538506909496, 55.984326921719294],
  [14.136956112421306, 55.983657732180184],
  [14.13333360567783, 55.98287198399784],
  [14.13333360567783, 55.98287198399784],
  [14.132511104894274, 55.982725334165],
  [14.132438470750987, 55.98277684119246],
  [14.133890950914486, 55.9858409987989],
  [14.133269840527506, 55.98591091124035],
  [14.127575748758474, 55.986721992249336],
  [14.127575748758474, 55.986721992249336],
  [14.126081878790496, 55.98396832956338],
  [14.123215077966426, 55.98437648150549],
  [14.122594256740873, 55.9832688653325],
];

function pointInPolygon(lng: number, lat: number): boolean {
  let inside = false;
  for (
    let i = 0, j = OUTLINE_POLYGON.length - 1;
    i < OUTLINE_POLYGON.length;
    j = i++
  ) {
    const [xi, yi] = OUTLINE_POLYGON[i];
    const [xj, yj] = OUTLINE_POLYGON[j];
    if (
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function segmentsIntersect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
): boolean {
  const dx = x2 - x1,
    dy = y2 - y1;
  const ex = x4 - x3,
    ey = y4 - y3;
  const denom = dx * ey - dy * ex;
  if (denom === 0) return false;
  const fx = x3 - x1,
    fy = y3 - y1;
  const t = (fx * ey - fy * ex) / denom;
  const u = (fx * dy - fy * dx) / denom;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function tileFullyInsideOutline(z: number, x: number, y: number): boolean {
  const n = 2 ** z;
  const lngMin = (x / n) * 360 - 180;
  const lngMax = ((x + 1) / n) * 360 - 180;
  const latMax =
    Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * (180 / Math.PI);
  const latMin =
    Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * (180 / Math.PI);

  if (
    !pointInPolygon(lngMin, latMin) ||
    !pointInPolygon(lngMin, latMax) ||
    !pointInPolygon(lngMax, latMin) ||
    !pointInPolygon(lngMax, latMax)
  ) {
    return false;
  }

  // All four corners inside — but a concave polygon edge could still cut
  // through the tile. Reject if any polygon edge crosses a tile edge.
  for (let i = 0; i < OUTLINE_POLYGON.length - 1; i++) {
    const [px1, py1] = OUTLINE_POLYGON[i];
    const [px2, py2] = OUTLINE_POLYGON[i + 1];
    if (
      segmentsIntersect(lngMin, latMin, lngMax, latMin, px1, py1, px2, py2) ||
      segmentsIntersect(lngMax, latMin, lngMax, latMax, px1, py1, px2, py2) ||
      segmentsIntersect(lngMax, latMax, lngMin, latMax, px1, py1, px2, py2) ||
      segmentsIntersect(lngMin, latMax, lngMin, latMin, px1, py1, px2, py2)
    ) {
      return false;
    }
  }
  return true;
}

// Minimal 1×1 transparent PNG
const TRANSPARENT_TILE = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABpfZFQAAAAABJRU5ErkJggg==",
  ),
  (c) => c.charCodeAt(0),
);

const osmTileStrategy = new CacheFirst({
  cacheName: "osm-tiles",
  plugins: [
    new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 30 }),
    new CacheableResponsePlugin({ statuses: [0, 200] }),
  ],
});

export const osmTilesRoute = new Route(
  ({ url }) => url.hostname === "tile.openstreetmap.org",
  async (options) => {
    const { url } = options;
    const parts = url.pathname.split("/");
    const z = parseInt(parts[1], 10);
    const x = parseInt(parts[2], 10);
    const y = parseInt(parts[3], 10);
    if (
      !Number.isNaN(z) &&
      !Number.isNaN(x) &&
      !Number.isNaN(y) &&
      tileFullyInsideOutline(z, x, y)
    ) {
      return new Response(TRANSPARENT_TILE, {
        headers: { "Content-Type": "image/png" },
      });
    }
    return osmTileStrategy.handle(options);
  },
);
