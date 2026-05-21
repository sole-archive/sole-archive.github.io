// Generates a 1080×1350 Instagram card for every paper in papers.json.
// Output: public/ig/paper/[slug].png
// Run: node scripts/generate_ig_paper_images.mjs

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

// ── Helpers ───────────────────────────────────────────────────────────────────
function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
}

// ── Design constants ──────────────────────────────────────────────────────────
const W        = 1080;
const H        = 1350;
const BAND_H   = 160;   // dark top band
const BODY_H   = H - BAND_H;
const PRIMARY  = '#1e3a8a';
const ACCENT   = '#3b82f6';
const TEXT_BODY  = '#374151';
const TEXT_MUTED = '#6b7280';
const BORDER   = '#e5e7eb';

// ── Card builder ──────────────────────────────────────────────────────────────
function buildCard(paper) {
  const title    = truncate(paper.title || 'Untitled', 120);
  const authors  = (paper.authors || []).join(', ');
  const abstract = truncate(paper.abstract || '', 640);
  const keywords = (paper.keywords || []).slice(0, 5);
  const venue    = truncate(paper.console_venue || '', 70);
  const year     = String(paper.year || '');

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

        // Dark top band — SOLE branding
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

        // White body
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: W,
              height: BODY_H,
              padding: '64px 80px 56px 80px',
            },
            children: [

              // Top group — all content
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [

                    // Edition badge + year
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                padding: '5px 18px',
                                borderRadius: 24,
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                fontSize: 20,
                                fontWeight: 600,
                                color: PRIMARY,
                                fontFamily: 'Inter',
                              },
                              children: paper.edition || '',
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', fontSize: 20, color: TEXT_MUTED, fontFamily: 'Inter' },
                              children: year,
                            },
                          },
                          {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontSize: 20, color: TEXT_MUTED, fontFamily: 'Inter' },
                        children: venue,
                      },
                    },
                        ],
                      },
                    },

                    // Title
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexWrap: 'wrap',
                          fontSize: 64,
                          fontWeight: 400,
                          color: PRIMARY,
                          fontFamily: 'Crimson Text',
                          lineHeight: 1.2,
                          marginBottom: 22,
                        },
                        children: title,
                      },
                    },

                    // Authors
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: 28,
                          fontWeight: 600,
                          color: ACCENT,
                          fontFamily: 'Inter',
                          marginBottom: 28,
                          flexWrap: 'wrap',
                        },
                        children: authors,
                      },
                    },

                    // Divider
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', height: 1, background: BORDER, marginBottom: 28 },
                      },
                    },

                    // Abstract
                    abstract ? {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexWrap: 'wrap',
                          fontSize: 28,
                          color: TEXT_BODY,
                          fontFamily: 'Inter',
                          lineHeight: 1.65,
                          marginBottom: 24,
                        },
                        children: abstract,
                      },
                    } : null,

                    // Keywords
                    keywords.length > 0 ? {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexWrap: 'wrap', gap: 8 },
                        children: keywords.map(kw => ({
                          type: 'div',
                          props: {
                            style: {
                              display: 'flex',
                              padding: '6px 18px',
                              borderRadius: 16,
                              background: '#f0f9ff',
                              border: '1px solid #bae6fd',
                              fontSize: 20,
                              color: '#0369a1',
                              fontFamily: 'Inter',
                            },
                            children: String(kw),
                          },
                        })),
                      },
                    } : null,

                  ].filter(Boolean),
                },
              },

              // Footer row
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  },
                  children: [
                    
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontSize: 20, color: TEXT_MUTED, fontFamily: 'Inter' },
                        children: 'SOLE Archive',
                      },
                    },
                  ],
                },
              },

            ],
          },
        },

        // Top bar — rendered last so it overlays both sections
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
async function generatePng(paper) {
  const element = buildCard(paper);
  const svg = await satori(element, { width: W, height: H, fonts: FONTS });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } });
  return resvg.render().asPng();
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const papersPath = join(root, 'src/content/papers.json');
  const papers     = JSON.parse(readFileSync(papersPath, 'utf-8'));
  const preview    = process.argv.includes('--preview');

  if (preview) {
    const paper = papers.find(p => p.abstract && p.slug) || papers[0];
    const png   = await generatePng(paper);
    const outArg = process.argv.find(a => a.startsWith('--out='));
    const out = outArg
      ? join(root, 'public', outArg.slice(6))
      : join(root, 'public/ig-paper-preview.png');
    writeFileSync(out, png);
    console.log(`Preview written to ${out} (${paper.slug})`);
    return;
  }

  const outDir = join(root, 'public/ig/paper');
  mkdirSync(outDir, { recursive: true });

  const total = papers.length;
  console.log(`Generating IG cards for ${total} papers…`);
  let done = 0;

  for (const paper of papers) {
    if (!paper.slug) continue;
    const png = await generatePng(paper);
    writeFileSync(join(outDir, `${paper.slug}.png`), png);
    done++;
    if (done % 50 === 0 || done === total) {
      process.stdout.write(`  ${done}/${total}\n`);
    }
  }

  console.log(`Done. Paper IG cards written to public/ig/paper/`);
}

main().catch(e => { console.error(e); process.exit(1); });
