import { Route } from "workbox-routing";

// The map sub-app's basemap is a single bundled PMTiles file that MapLibre/
// pmtiles.js reads with HTTP Range requests (it never fetches the whole file at
// once). A normal Workbox strategy would cache a single partial 206 response
// and then hand those same bytes back for every future range — corrupting the
// map. The file is tiny (~65 KB), so instead we fetch and cache the COMPLETE
// 200 response once and satisfy each Range request by slicing it out of the
// cached body. This makes the basemap render fully offline after one online
// load, with no dependency on workbox-range-requests.

const CACHE_NAME = "map-pmtiles";

type FullFile = { buffer: ArrayBuffer; contentType: string };

// In-memory memo of the fully-downloaded basemap. A single map view fires
// hundreds of Range requests; without this we'd re-open the Cache and re-read
// the entire body into an ArrayBuffer for each one. Keyed by URL (only one
// hashed .pmtiles is live at a time). The retained promise also dedupes the
// concurrent cold-start requests so the file is downloaded once, not N times.
let fileUrl: string | undefined;
let filePromise: Promise<FullFile | undefined> | undefined;

async function loadFullFile(url: string): Promise<FullFile | undefined> {
  const cache = await caches.open(CACHE_NAME);
  let res = await cache.match(url);

  if (!res) {
    // Fetch the whole file (no Range header) so a single cached 200 can serve
    // any byte range later, including offline.
    try {
      res = await fetch(url);
    } catch {
      // Offline with nothing cached yet — signal failure so the caller can
      // fall back to the network path.
      return undefined;
    }
    if (res.status !== 200) return undefined;

    // Only one PMTiles file is live at a time; drop older (hashed-URL) copies
    // so the cache doesn't grow across deploys.
    for (const key of await cache.keys()) {
      if (key.url !== url) await cache.delete(key);
    }
    await cache.put(url, res.clone());
  }

  return {
    buffer: await res.arrayBuffer(),
    contentType: res.headers.get("Content-Type") ?? "application/octet-stream",
  };
}

function getFullFile(url: string): Promise<FullFile | undefined> {
  if (fileUrl === url && filePromise) return filePromise;

  const promise = loadFullFile(url).then((result) => {
    // Don't memoise failures (e.g. a cold offline start): clear so the next
    // request retries once connectivity returns.
    if (!result && fileUrl === url) {
      fileUrl = undefined;
      filePromise = undefined;
    }
    return result;
  });

  fileUrl = url;
  filePromise = promise;
  return promise;
}

// Returns the requested byte range, or "unsatisfiable" for a parseable but
// out-of-bounds range (→ 416), or null for a header we don't understand (e.g. a
// multi-range request) so the caller can fall back to serving the full file.
function parseRange(
  header: string,
  size: number,
): { start: number; end: number } | "unsatisfiable" | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;

  const [, rawStart, rawEnd] = match;
  let start: number;
  let end: number;

  if (rawStart === "") {
    // Suffix range ("bytes=-500" → last 500 bytes).
    if (rawEnd === "") return null;
    const length = Number(rawEnd);
    if (length <= 0) return "unsatisfiable";
    start = Math.max(0, size - length);
    end = size - 1;
  } else {
    start = Number(rawStart);
    if (start >= size) return "unsatisfiable";
    end = rawEnd === "" ? size - 1 : Math.min(Number(rawEnd), size - 1);
  }

  if (start > end) return "unsatisfiable";
  return { start, end };
}

async function handlePmtiles(request: Request): Promise<Response> {
  const file = await getFullFile(request.url);
  if (!file) {
    // Couldn't obtain a full copy (e.g. first load while offline). Let the
    // original request go to the network so behaviour is unchanged; surface a
    // network error rather than throwing out of the route handler.
    return fetch(request).catch(() => Response.error());
  }

  const { buffer, contentType } = file;

  const rangeHeader = request.headers.get("range");
  if (!rangeHeader) {
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
        "Accept-Ranges": "bytes",
      },
    });
  }

  const range = parseRange(rangeHeader, buffer.byteLength);

  // Header we don't understand → ignore the Range and return the whole file
  // (an allowed response to a range request; a correct client uses the body).
  if (range === null) {
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
        "Accept-Ranges": "bytes",
      },
    });
  }

  if (range === "unsatisfiable") {
    return new Response(null, {
      status: 416,
      statusText: "Range Not Satisfiable",
      headers: { "Content-Range": `bytes */${buffer.byteLength}` },
    });
  }

  const slice = buffer.slice(range.start, range.end + 1);
  return new Response(slice, {
    status: 206,
    statusText: "Partial Content",
    headers: {
      "Content-Type": contentType,
      "Content-Range": `bytes ${range.start}-${range.end}/${buffer.byteLength}`,
      "Content-Length": String(slice.byteLength),
      "Accept-Ranges": "bytes",
    },
  });
}

export const mapPmtilesRoute = new Route(
  ({ url }) =>
    url.pathname.startsWith("/_services/map/") &&
    url.pathname.endsWith(".pmtiles"),
  ({ request }) => handlePmtiles(request),
);
