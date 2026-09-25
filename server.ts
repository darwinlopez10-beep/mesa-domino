import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Helper to decode HTML entities returned by YouTube API snippet text
function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// In-memory search cache for fast repeated queries (24 hours TTL)
const searchCache = new Map<string, { time: number; results: any[] }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helper to execute search across YouTube APIs with multiple fallback layers
async function fetchYouTubeTracks(query: string, customKey?: string): Promise<{ results: any[]; apiError: any | null }> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return { results: [], apiError: null };

  const cacheKey = cleanQuery.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS && cached.results.length > 0) {
    return { results: cached.results, apiError: null };
  }

  let finalResults: any[] = [];
  const seenVideoIds = new Set<string>();
  let youtubeApiError: { status: number; message: string; reason: string } | null = null;

  // Layer 0: Official Google YouTube Data API v3
  // Endpoint: https://www.googleapis.com/youtube/v3/search
  // Broad search parameters:
  // - part=snippet
  // - type=video
  // - maxResults=15
  // - q=${encodeURIComponent(cleanQuery)}
  // - key=${youtubeApiKey}
  const youtubeApiKey =
    (customKey && customKey.trim()) ||
    process.env.YOUTUBE_API_KEY ||
    process.env.VITE_YOUTUBE_API_KEY ||
    '';

  if (youtubeApiKey) {
    try {
      const searchEndpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=15&q=${encodeURIComponent(cleanQuery)}&key=${youtubeApiKey}`;
      const apiResponse = await fetch(searchEndpoint, {
        signal: AbortSignal.timeout(6000),
      });

      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        if (Array.isArray(apiData?.items) && apiData.items.length > 0) {
          for (const item of apiData.items) {
            const vid = item?.id?.videoId;
            if (vid && typeof vid === 'string' && vid.length === 11 && !seenVideoIds.has(vid)) {
              seenVideoIds.add(vid);
              const title = decodeHtmlEntities(item.snippet?.title || '').trim();
              const artist = decodeHtmlEntities(item.snippet?.channelTitle || cleanQuery).trim();
              const thumb =
                item.snippet?.thumbnails?.high?.url ||
                item.snippet?.thumbnails?.medium?.url ||
                item.snippet?.thumbnails?.default?.url ||
                `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;

              if (title) {
                finalResults.push({
                  id: `yt_${vid}`,
                  videoId: vid,
                  title,
                  artist,
                  sourceType: 'youtube',
                  url: `https://www.youtube.com/embed/${vid}?autoplay=1&playsinline=1&enablejsapi=1`,
                  artworkUrl: thumb,
                  durationText: '',
                });
              }
            }
          }
        }
      } else {
        const errJson = await apiResponse.json().catch(() => null);
        youtubeApiError = {
          status: apiResponse.status,
          message: errJson?.error?.message || apiResponse.statusText,
          reason:
            errJson?.error?.errors?.[0]?.reason ||
            errJson?.error?.details?.[0]?.reason ||
            (apiResponse.status === 403 ? 'quotaExceeded' : 'badRequest'),
        };
        console.warn('YouTube Data API v3 returned non-ok response:', apiResponse.status, youtubeApiError);
      }
    } catch (err: any) {
      console.warn('YouTube Data API v3 fetch error:', err);
      youtubeApiError = {
        status: 0,
        message: err?.message || 'Network error connecting to YouTube',
        reason: 'networkError',
      };
    }
  }

  // If Layer 0 returned high-quality results, cache and return immediately
  if (finalResults.length > 0) {
    const validResults = finalResults.slice(0, 20);
    searchCache.set(cacheKey, { time: Date.now(), results: validResults });
    return { results: validResults, apiError: null };
  }

  const walkInnertube = (o: any) => {
    if (!o || typeof o !== 'object') return;
    if (o.videoId && typeof o.videoId === 'string' && o.videoId.length === 11) {
      if (o.title && !seenVideoIds.has(o.videoId)) {
        seenVideoIds.add(o.videoId);
        const title =
          (Array.isArray(o.title?.runs) ? o.title.runs.map((r: any) => r.text).join('') : '') ||
          o.title?.simpleText ||
          o.headline?.simpleText ||
          '';
        const artist =
          (Array.isArray(o.ownerText?.runs) ? o.ownerText.runs.map((r: any) => r.text).join('') : '') ||
          (Array.isArray(o.shortBylineText?.runs) ? o.shortBylineText.runs.map((r: any) => r.text).join('') : '') ||
          (Array.isArray(o.longBylineText?.runs) ? o.longBylineText.runs.map((r: any) => r.text).join('') : '') ||
          cleanQuery;

        let durationText = o.lengthText?.simpleText || '';
        if (!durationText && Array.isArray(o.thumbnailOverlays)) {
          for (const ov of o.thumbnailOverlays) {
            const time = ov?.thumbnailOverlayTimeStatusRenderer?.text?.simpleText;
            if (time) {
              durationText = time;
              break;
            }
          }
        }

        const thumb =
          o.thumbnail?.thumbnails?.[o.thumbnail.thumbnails.length - 1]?.url ||
          `https://img.youtube.com/vi/${o.videoId}/hqdefault.jpg`;

        if (title) {
          finalResults.push({
            id: `yt_${o.videoId}`,
            videoId: o.videoId,
            title: title.trim(),
            artist: artist.trim(),
            sourceType: 'youtube',
            url: `https://www.youtube.com/embed/${o.videoId}?autoplay=1&playsinline=1&enablejsapi=1`,
            artworkUrl: thumb,
            durationText: durationText.trim(),
          });
        }
      }
      return;
    }
    for (const k of Object.keys(o)) {
      if (k !== 'trackingParams' && k !== 'innertubeCommand') {
        walkInnertube(o[k]);
      }
    }
  };

  // Layer 1: Innertube WEB client (Fast & comprehensive)
  try {
    const innertubeRes = await fetch('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', {
      method: 'POST',
      signal: AbortSignal.timeout(5000),
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240313.01.00',
            hl: 'es',
            gl: 'US',
          },
        },
        query: cleanQuery,
      }),
    });

    if (innertubeRes.ok) {
      const data = await innertubeRes.json();
      walkInnertube(data);
    }
  } catch {
    // Continue to next layer
  }

  // Layer 2: Innertube MWEB client (Mobile Web endpoint fallback)
  if (finalResults.length === 0) {
    try {
      const mwebRes = await fetch('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', {
        method: 'POST',
        signal: AbortSignal.timeout(5000),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'MWEB',
              clientVersion: '2.20240313.01.00',
              hl: 'es',
              gl: 'US',
            },
          },
          query: cleanQuery,
        }),
      });

      if (mwebRes.ok) {
        const data = await mwebRes.json();
        walkInnertube(data);
      }
    } catch {
      // Continue to next layer
    }
  }

  // Layer 3: YouTube HTML scraping fallback
  if (finalResults.length === 0) {
    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery)}`;
      const response = await fetch(searchUrl, {
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        },
      });

      if (response.ok) {
        const html = await response.text();
        const marker = 'ytInitialData';
        const markerIdx = html.indexOf(marker);
        if (markerIdx !== -1) {
          const eqIdx = html.indexOf('=', markerIdx);
          if (eqIdx !== -1) {
            const startBrace = html.indexOf('{', eqIdx);
            if (startBrace !== -1) {
              let depth = 0;
              let inString = false;
              let escape = false;
              let endBrace = -1;
              for (let i = startBrace; i < html.length; i++) {
                const char = html[i];
                if (escape) {
                  escape = false;
                  continue;
                }
                if (char === '\\') {
                  escape = true;
                  continue;
                }
                if (char === '"' && !escape) {
                  inString = !inString;
                  continue;
                }
                if (!inString) {
                  if (char === '{') depth++;
                  else if (char === '}') {
                    depth--;
                    if (depth === 0) {
                      endBrace = i;
                      break;
                    }
                  }
                }
              }
              if (endBrace !== -1) {
                try {
                  const data = JSON.parse(html.substring(startBrace, endBrace + 1));
                  walkInnertube(data);
                } catch {
                  // Ignore parse error
                }
              }
            }
          }
        }

        // Regex fallback
        if (finalResults.length === 0) {
          const vidRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
          let match;
          while ((match = vidRegex.exec(html)) !== null && finalResults.length < 25) {
            const vid = match[1];
            if (!seenVideoIds.has(vid)) {
              seenVideoIds.add(vid);
              finalResults.push({
                id: `yt_${vid}`,
                videoId: vid,
                title: `${cleanQuery} - Éxito`,
                artist: cleanQuery,
                sourceType: 'youtube',
                url: `https://www.youtube.com/embed/${vid}?autoplay=1&playsinline=1&enablejsapi=1`,
                artworkUrl: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
                durationText: '',
              });
            }
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  // Layer 4: Invidious public mirror fallback
  if (finalResults.length === 0) {
    try {
      const invRes = await fetch(
        `https://invidious.flokinet.to/api/v1/search?q=${encodeURIComponent(cleanQuery)}&type=video`,
        { signal: AbortSignal.timeout(3000) }
      );
      if (invRes.ok) {
        const invData = await invRes.json();
        if (Array.isArray(invData) && invData.length > 0) {
          for (const v of invData) {
            if (v.videoId && !seenVideoIds.has(v.videoId)) {
              seenVideoIds.add(v.videoId);
              const dur = v.lengthSeconds || 0;
              const m = Math.floor(dur / 60);
              const s = dur % 60;
              finalResults.push({
                id: `yt_${v.videoId}`,
                videoId: v.videoId,
                title: v.title,
                artist: v.author || cleanQuery,
                sourceType: 'youtube',
                url: `https://www.youtube.com/embed/${v.videoId}?autoplay=1&playsinline=1&enablejsapi=1`,
                artworkUrl: `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
                durationText: dur > 0 ? `${m}:${s < 10 ? '0' : ''}${s}` : '',
              });
            }
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  // Filter and limit to top 35 clean results
  const validResults = finalResults.filter(
    (r) => r.videoId && typeof r.videoId === 'string' && r.videoId.length === 11
  ).slice(0, 35);

  if (validResults.length > 0) {
    searchCache.set(cacheKey, { time: Date.now(), results: validResults });
  }

  return { results: validResults, apiError: validResults.length > 0 ? null : youtubeApiError };
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Shared Music / YouTube search handler (supports both /api/music/search and /api/youtube/search)
  const handleMusicSearch = async (req: express.Request, res: express.Response) => {
    const query = (req.query.q as string)?.trim();
    const customKey = (req.query.key as string)?.trim();
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
      const { results, apiError } = await fetchYouTubeTracks(query, customKey);
      return res.json({ results, query, success: true, apiError });
    } catch (err: unknown) {
      console.error("Error during search:", err);
      return res.json({
        results: [],
        query,
        error: "Failed to complete search",
        apiError: { status: 500, message: "Error interno del servidor al buscar en YouTube", reason: "serverError" }
      });
    }
  };

  // Mount on both routes so mobile adblockers don't block /api/music/search
  app.get("/api/music/search", handleMusicSearch);
  app.get("/api/youtube/search", handleMusicSearch);

  // YouTube Info (via oEmbed) endpoint
  app.get('/api/youtube/info', async (req, res) => {
    const rawUrl = (req.query.url as string)?.trim();
    if (!rawUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(rawUrl)}&format=json`;
      const response = await fetch(oembedUrl);

      if (!response.ok) {
        return res.status(404).json({ error: 'Video not found or invalid URL' });
      }

      const data = await response.json();
      res.json(data);
    } catch (err: unknown) {
      console.error('Error fetching YouTube info:', err);
      res.status(500).json({ error: 'Failed to fetch video info' });
    }
  });

  // Vite middleware for development, or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Domino Scoreboard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
