// Generates a 1080×1350 Instagram card for every volume derived from papers.json.
// Output: public/ig/vol/[slug].png
// Run: node scripts/generate_ig_volume_images.mjs

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ── Fonts ─────────────────────────────────────────────────────────────────────
const interRegular   = readFileSync(join(__dirname, 'fonts/inter-400.ttf')).buffer;
const interSemiBold  = readFileSync(join(__dirname, 'fonts/inter-600.ttf')).buffer;
const crimsonRegular = readFileSync(join(__dirname, 'fonts/crimson-400.ttf')).buffer;

const FONTS = [
  { name: 'Inter',        data: interRegular,   weight: 400, style: 'normal' },
  { name: 'Inter',        data: interSemiBold,  weight: 600, style: 'normal' },
  { name: 'Crimson Text', data: crimsonRegular, weight: 400, style: 'normal' },
];

// ── Logo ──────────────────────────────────────────────────────────────────────
const logoDataUrl = (() => {
  const buf = readFileSync(join(root, 'public/logo.png'));
  return `data:image/png;base64,${buf.toString('base64')}`;
})();

// ── Roman numerals ────────────────────────────────────────────────────────────
function toRoman(n) {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { result += syms[i]; n -= vals[i]; }
  }
  return result;
}

function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
}

// ── Design constants ──────────────────────────────────────────────────────────
const W        = 1080;
const H        = 1350;
const BAND_H   = 180;   // top band (SOLE branding)
const TITLE_H  = 310;   // year/venue + title + editors with breathing room
const BOTTOM_H = H - BAND_H - TITLE_H; // 860 — cover + contributors
const PRIMARY  = '#1e3a8a';
const TEXT_BODY  = '#374151';
const TEXT_MUTED = '#6b7280';
const BORDER   = '#e5e7eb';
const AMBER    = 'rgba(245,158,11,0.88)';
const AMBER_DIM = 'rgba(245,158,11,0.45)';

// Cover dimensions (5:7 ratio), sized for the left column
const COVER_W = 360;
const COVER_H = Math.round(COVER_W * 7 / 5); // 504

// Two-column split in the bottom section
const LEFT_COL_W  = 460;
const RIGHT_COL_W = W - LEFT_COL_W; // 620

// ── Book cover element ────────────────────────────────────────────────────────
function buildCoverEl(roman, year, editors) {
  const mapSize = Math.round(COVER_W * 1.3);
  const mapLeft = Math.round(COVER_W * 0.55 - mapSize / 2);
  const mapTop  = Math.round(COVER_H * 0.48 - mapSize / 2);

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: COVER_W,
        height: COVER_H,
        background: 'linear-gradient(155deg, #0e1f57 0%, #1e3a8a 45%, #1c3fb5 100%)',
        borderRadius: '3px 10px 10px 3px',
        boxShadow: '-8px 14px 36px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(245,158,11,0.2)',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px 18px',
      },
      children: [

        // Spine shadow
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              position: 'absolute',
              left: 0, top: 0,
              width: 9, height: COVER_H,
              background: 'linear-gradient(to right, rgba(0,0,0,0.45), transparent)',
            },
          },
        },

        // Logo watermark
        {
          type: 'img',
          props: {
            src: logoDataUrl,
            style: {
              position: 'absolute',
              width: mapSize,
              height: mapSize,
              left: mapLeft,
              top: mapTop,
              opacity: 0.07,
            },
          },
        },

        // ─── SOLE ─── header rule
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: 7 },
            children: [
              { type: 'div', props: { style: { display: 'flex', flex: 1, height: 1, background: AMBER_DIM } } },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: 10, letterSpacing: 5, color: AMBER, fontFamily: 'Inter', fontWeight: 600 },
                  children: 'SOLE',
                },
              },
              { type: 'div', props: { style: { display: 'flex', flex: 1, height: 1, background: AMBER_DIM } } },
            ],
          },
        },

        // Roman numeral + ConSOLE · YEAR
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: 68, fontWeight: 400, color: 'white', fontFamily: 'Crimson Text', lineHeight: 1 },
                  children: roman,
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: 13, letterSpacing: 1, color: 'rgba(255,255,255,0.42)', fontFamily: 'Inter', marginTop: 10 },
                  children: `ConSOLE · ${year}`,
                },
              },
            ],
          },
        },

        // Footer: amber rule + editors
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
            children: [
              { type: 'div', props: { style: { display: 'flex', alignSelf: 'stretch', height: 1, background: AMBER_DIM, marginBottom: 5 } } },
              ...editors.map(e => ({
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: 13, color: 'rgba(255,255,255,0.52)', fontFamily: 'Crimson Text', textAlign: 'center' },
                  children: e,
                },
              })),
            ],
          },
        },

      ],
    },
  };
}

// ── Full IG card ──────────────────────────────────────────────────────────────
function buildCard(volume) {
  const num      = parseInt(volume.edition.replace('ConSOLE ', '').trim());
  const roman    = toRoman(num);
  const year     = String(volume.year);
  const fullTitle = `Proceedings of ConSOLE ${roman}`;
  const editorsStr = volume.editors.join(', ');
  const contributorsStr = volume.authors.join(', ');
  const coverEl  = buildCoverEl(roman, year, volume.editors);

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: W,
        height: H,
        background: '#ffffff',
        fontFamily: 'Inter',
        position: 'relative',
        overflow: 'hidden',
      },
      children: [

        // ── 1. Top band — SOLE branding ──────────────────────────────────────
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: W,
              height: BAND_H,
              background: 'linear-gradient(135deg, #6379c3 0%, #1e3a8a 60%, #1c3fb5 100%)',
              gap: 14,
            },
            children: [
              {
                type: 'img',
                props: {
                  src: logoDataUrl,
                  style: { width: 54, height: 54, opacity: 0.9 },
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', gap: 3 },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontSize: 28, fontWeight: 600, color: 'rgba(255,255,255,0.95)', fontFamily: 'Inter' },
                        children: 'SOLE Archive',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontSize: 23, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter', letterSpacing: 1 },
                        children: 'ConSOLE Proceedings',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // ── 2. Year/venue + Title + Editors (left-aligned) ───────────────────
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              width: W,
              height: TITLE_H,
              padding: '44px 80px 44px 80px',
              gap: 12,
              borderBottom: `2px solid ${BORDER}`,
            },
            children: [
              // Year · venue
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 28,
                    color: TEXT_MUTED,
                    fontFamily: 'Inter',
                  },
                  children: [
                    { type: 'div', props: { style: { display: 'flex', fontWeight: 600, color: PRIMARY, fontFamily: 'Inter' }, children: year } },
                    { type: 'div', props: { style: { display: 'flex', fontFamily: 'Inter' }, children: '·' } },
                    { type: 'div', props: { style: { display: 'flex', fontFamily: 'Inter' }, children: truncate(volume.venue, 70) } },
                  ],
                },
              },
              // Volume title
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    fontSize: 70,
                    fontWeight: 400,
                    color: PRIMARY,
                    fontFamily: 'Crimson Text',
                    lineHeight: 1.2,
                  },
                  children: fullTitle,
                },
              },
              // Editors
              editorsStr ? {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    fontSize: 25,
                    color: TEXT_BODY,
                    fontFamily: 'Inter',
                  },
                  children: [
                    { type: 'div', props: { style: { display: 'flex', fontWeight: 600, fontFamily: 'Inter' }, children: 'Edited by:' } },
                    { type: 'div', props: { style: { display: 'flex', color: TEXT_MUTED, fontFamily: 'Inter' }, children: editorsStr } },
                  ],
                },
              } : null,
            ].filter(Boolean),
          },
        },

        // ── 3. Bottom: cover (left) + contributors (right) ───────────────────
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              width: W,
              height: BOTTOM_H,
            },
            children: [

              // Left column — book cover, vertically centered
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: LEFT_COL_W,
                    height: BOTTOM_H,
                    padding: '40px 20px 40px 50px',
                  },
                  children: [coverEl],
                },
              },

              // Right column — contributors, starting from top
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    width: RIGHT_COL_W,
                    height: BOTTOM_H,
                    padding: '110px 60px 40px 24px',
                  },
                  children: [
                    // "Contributors:" label
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: 32,
                          fontWeight: 600,
                          color: TEXT_BODY,
                          fontFamily: 'Inter',
                          marginBottom: 16,
                        },
                        children: 'Contributors:',
                      },
                    },
                    // Names as a single justified text block
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexWrap: 'wrap',
                          fontSize: 30,
                          color: TEXT_MUTED,
                          fontFamily: 'Inter',
                          lineHeight: 1.7,
                          textAlign: 'justify',
                        },
                        children: contributorsStr,
                      },
                    },
                  ],
                },
              },

            ],
          },
        },

        // Top bar — rendered last so it overlays the band
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              position: 'absolute',
              top: 0, left: 0,
              width: W, height: 8,
              background: `linear-gradient(90deg, #0e1f57 0%, ${PRIMARY} 50%, #3b82f6 100%)`,
            },
          },
        },

      ],
    },
  };
}

// ── Generate PNG ──────────────────────────────────────────────────────────────
async function generatePng(volume) {
  const element = buildCard(volume);
  const svg = await satori(element, { width: W, height: H, fonts: FONTS });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } });
  return resvg.render().asPng();
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const papersPath = join(root, 'src/content/papers.json');
  const papers     = JSON.parse(readFileSync(papersPath, 'utf-8'));
  const preview    = process.argv.includes('--preview');

  // Group papers by edition into volumes
  const editionMap = new Map();
  for (const paper of papers) {
    const slug = paper.edition.toLowerCase().replace(/\s+/g, '-');
    if (!editionMap.has(paper.edition)) {
      editionMap.set(paper.edition, {
        edition: paper.edition,
        year: paper.year,
        editors: paper.editors,
        venue: paper.console_venue,
        slug,
        count: 0,
        authorSet: new Set(),
      });
    }
    const vol = editionMap.get(paper.edition);
    vol.count++;
    for (const a of (paper.authors || [])) vol.authorSet.add(a);
  }

  const volumes = Array.from(editionMap.values()).map(vol => ({
    ...vol,
    authors: Array.from(vol.authorSet).sort(),
  }));

  if (preview) {
    const vol = volumes.sort((a, b) => b.year - a.year)[0];
    const png = await generatePng(vol);
    const outArg = process.argv.find(a => a.startsWith('--out='));
    const out = outArg
      ? join(root, 'public', outArg.slice(6))
      : join(root, 'public/ig-volume-preview.png');
    writeFileSync(out, png);
    console.log(`Preview written to ${out} (${vol.slug})`);
    return;
  }

  const outDir = join(root, 'public/ig/vol');
  mkdirSync(outDir, { recursive: true });

  console.log(`Generating IG cards for ${volumes.length} volumes…`);
  let done = 0;

  for (const vol of volumes) {
    const png = await generatePng(vol);
    writeFileSync(join(outDir, `${vol.slug}.png`), png);
    done++;
    process.stdout.write(`  ${done}/${volumes.length}  ${vol.slug}\n`);
  }

  console.log(`Done. Volume IG cards written to public/ig/vol/`);
}

main().catch(e => { console.error(e); process.exit(1); });
