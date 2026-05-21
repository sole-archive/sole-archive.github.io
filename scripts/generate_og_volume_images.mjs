// Generates a 1200×630 OG PNG for every volume derived from papers.json.
// Output: public/og/{slug}.png  (e.g. public/og/console-33.png)
// Run: node scripts/generate_og_volume_images.mjs

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
const W         = 1200;
const H         = 630;
const PRIMARY   = '#1e3a8a';
const TEXT_BODY = '#374151';
const TEXT_MUTED = '#6b7280';
const BORDER    = '#e5e7eb';
const AMBER     = 'rgba(245,158,11,0.88)';
const AMBER_DIM = 'rgba(245,158,11,0.45)';

const LEFT_W  = 360;
const COVER_W = 218;
const COVER_H = Math.round(COVER_W * 7 / 5); // 5:7 ratio → 305

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
        borderRadius: '2px 7px 7px 2px',
        boxShadow: '-6px 8px 24px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(245,158,11,0.18)',
        position: 'relative',
        overflow: 'hidden',
        padding: '18px 14px',
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
              width: 8, height: COVER_H,
              background: 'linear-gradient(to right, rgba(0,0,0,0.42), transparent)',
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
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            },
            children: [
              { type: 'div', props: { style: { display: 'flex', flex: 1, height: 1, background: AMBER_DIM } } },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: 9,
                    letterSpacing: 5,
                    color: AMBER,
                    fontFamily: 'Inter',
                    fontWeight: 600,
                  },
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
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: 54,
                    fontWeight: 400,
                    color: 'white',
                    fontFamily: 'Crimson Text',
                    lineHeight: 1,
                    textShadow: '0 2px 18px rgba(0,0,0,0.5)',
                  },
                  children: roman,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: 11,
                    letterSpacing: 1,
                    color: 'rgba(255,255,255,0.42)',
                    fontFamily: 'Inter',
                    marginTop: 8,
                  },
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
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignSelf: 'stretch',
                    height: 1,
                    background: AMBER_DIM,
                    marginBottom: 4,
                  },
                },
              },
              ...editors.map(e => ({
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.52)',
                    fontFamily: 'Crimson Text',
                    textAlign: 'center',
                  },
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

// ── Full OG card ──────────────────────────────────────────────────────────────
function buildCard(volume) {
  const num      = parseInt(volume.edition.replace('ConSOLE ', '').trim());
  const roman    = toRoman(num);
  const year     = String(volume.year);
  const fullTitle = `Proceedings of ConSOLE ${roman}`;
  const venue    = truncate(volume.venue, 70);
  const editorsStr = volume.editors.join(', ');
  const contributorsStr = truncate(volume.authors.join(', '), 630);
  const coverEl  = buildCoverEl(roman, year, volume.editors);

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: W,
        height: H,
        background: '#ffffff',
        fontFamily: 'Inter',
        position: 'relative',
        overflow: 'hidden',
      },
      children: [

        // Left panel with book cover
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              width: LEFT_W,
              height: H,
              background: '#dbecff',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            },
            children: [coverEl],
          },
        },

        // Right white panel — metadata
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              padding: '48px 56px 44px 52px',
            },
            children: [

              // SOLE Archive header
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 28,
                  },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: logoDataUrl,
                        style: { width: 30, height: 30, objectFit: 'contain' },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', gap: 1 },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', fontSize: 15, fontWeight: 600, color: PRIMARY, fontFamily: 'Inter' },
                              children: 'SOLE Archive',
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', fontSize: 11, color: TEXT_MUTED, fontFamily: 'Inter' },
                              children: 'ConSOLE Proceedings',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },

              // Edition + year + venue row
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 14,
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          padding: '4px 14px',
                          borderRadius: 20,
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          fontSize: 13,
                          fontWeight: 600,
                          color: PRIMARY,
                          fontFamily: 'Inter',
                        },
                        children: volume.edition,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontSize: 13, color: TEXT_MUTED, fontFamily: 'Inter' },
                        children: year,
                      },
                    },
                    venue ? {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontSize: 13, color: TEXT_MUTED, fontFamily: 'Inter' },
                        children: '·',
                      },
                    } : null,
                    venue ? {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontSize: 13, color: TEXT_MUTED, fontFamily: 'Inter' },
                        children: venue,
                      },
                    } : null,
                  ].filter(Boolean),
                },
              },

              // Full title
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    fontSize: 42,
                    fontWeight: 400,
                    color: PRIMARY,
                    fontFamily: 'Crimson Text',
                    lineHeight: 1.2,
                    marginBottom: 18,
                  },
                  children: fullTitle,
                },
              },

              // Horizontal divider
              {
                type: 'div',
                props: {
                  style: { display: 'flex', height: 1, background: BORDER, marginBottom: 18 },
                },
              },

              // Editors
              editorsStr ? {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    gap: 5,
                    fontSize: 20,
                    color: TEXT_BODY,
                    fontFamily: 'Inter',
                    marginBottom: 10,
                    flexWrap: 'wrap',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontWeight: 600, color: TEXT_BODY, fontFamily: 'Inter' },
                        children: 'Edited by:',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', color: TEXT_MUTED, fontFamily: 'Inter' },
                        children: editorsStr,
                      },
                    },
                  ],
                },
              } : null,

              // Contributors
              contributorsStr ? {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    gap: 5,
                    fontSize: 17,
                    color: TEXT_BODY,
                    fontFamily: 'Inter',
                    marginBottom: 14,
                    flexWrap: 'wrap',
                    lineHeight: 1.5,
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontWeight: 600, color: TEXT_BODY, fontFamily: 'Inter' },
                        children: 'Contributors:',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', color: TEXT_MUTED, fontFamily: 'Inter', flexWrap: 'wrap' },
                        children: contributorsStr,
                      },
                    },
                  ],
                },
              } : null,

              // Paper count
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: 17,
                    color: TEXT_MUTED,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                  },
                  children: `${volume.count} papers`,
                },
              },

            ].filter(Boolean),
          },
        },

        // Top gradient bar — last so it paints over both panels
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              position: 'absolute',
              top: 0, left: 0,
              width: W, height: 6,
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
      : join(root, 'public/og-volume-preview.png');
    writeFileSync(out, png);
    console.log(`Preview written to ${out} (${vol.slug})`);
    return;
  }

  const outDir = join(root, 'public/og');
  mkdirSync(outDir, { recursive: true });

  console.log(`Generating OG images for ${volumes.length} volumes…`);
  let done = 0;

  for (const vol of volumes) {
    const png = await generatePng(vol);
    writeFileSync(join(outDir, `${vol.slug}.png`), png);
    done++;
    process.stdout.write(`  ${done}/${volumes.length}  ${vol.slug}\n`);
  }

  console.log(`Done. Volume OG images written to public/og/`);
}

main().catch(e => { console.error(e); process.exit(1); });
