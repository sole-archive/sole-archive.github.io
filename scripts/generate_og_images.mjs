// Generates a 1200×630 OG PNG for every paper in papers.json.
// Output: public/og/[slug].png
// Run: node scripts/generate_og_images.mjs

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ── Fonts ────────────────────────────────────────────────────────────────────
const interRegular   = readFileSync(join(__dirname, 'fonts/inter-400.ttf')).buffer;
const interSemiBold  = readFileSync(join(__dirname, 'fonts/inter-600.ttf')).buffer;
const crimsonRegular = readFileSync(join(__dirname, 'fonts/crimson-400.ttf')).buffer;

const FONTS = [
  { name: 'Inter',        data: interRegular,   weight: 400, style: 'normal' },
  { name: 'Inter',        data: interSemiBold,  weight: 600, style: 'normal' },
  { name: 'Crimson Text', data: crimsonRegular, weight: 400, style: 'normal' },
];

// ── Logo ─────────────────────────────────────────────────────────────────────
const logoDataUrl = (() => {
  const buf = readFileSync(join(root, 'public/logo.png'));
  return `data:image/png;base64,${buf.toString('base64')}`;
})();

// ── Design constants ─────────────────────────────────────────────────────────
const W = 1200;
const H = 630;
const PRIMARY      = '#1e3a8a';
const ACCENT       = '#3b82f6';
const TEXT_BODY    = '#374151';
const TEXT_MUTED   = '#6b7280';
const BORDER       = '#e5e7eb';
const ABSTRACT_MAX = 550;

function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
}

// ── Card builder ─────────────────────────────────────────────────────────────
function buildCard(paper) {
  const title    = truncate(paper.title || 'Untitled', 110);
  const authors  = (paper.authors || []).join(', ');
  const abstract = truncate(paper.abstract || '', ABSTRACT_MAX);
  const keywords = (paper.keywords || []).slice(0, 5);
  const edition  = paper.edition || '';
  const year     = paper.year ? String(paper.year) : '';

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

        // Top gradient bar
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: 6,
              background: `linear-gradient(90deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
              display: 'flex',
            },
          },
        },

        // Main content
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              padding: '48px 72px 44px 72px',
            },
            children: [

              // Header row
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 24,
                  },
                  children: [
                    // Logo + site name
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center', gap: 10 },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: logoDataUrl,
                              width: 38,
                              height: 38,
                              style: {
                                width: 38,
                                height: 38,
                                objectFit: 'contain',
                                display: 'flex',
                              },
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
                                    style: { fontSize: 15, fontWeight: 600, color: PRIMARY, fontFamily: 'Inter', display: 'flex' },
                                    children: 'SOLE Archive',
                                  },
                                },
                                {
                                  type: 'div',
                                  props: {
                                    style: { fontSize: 12, color: TEXT_MUTED, fontFamily: 'Inter', display: 'flex' },
                                    children: 'ConSOLE Proceedings',
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                    // Edition + year
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center', gap: 8 },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                padding: '4px 14px',
                                borderRadius: 20,
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                fontSize: 13,
                                fontWeight: 600,
                                color: PRIMARY,
                                fontFamily: 'Inter',
                                display: 'flex',
                              },
                              children: edition,
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: { fontSize: 13, color: TEXT_MUTED, fontFamily: 'Inter', display: 'flex' },
                              children: year,
                            },
                          },
                        ],
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
                    fontSize: 40,
                    fontWeight: 400,
                    color: PRIMARY,
                    fontFamily: 'Crimson Text',
                    lineHeight: 1.25,
                    marginBottom: 12,
                    display: 'flex',
                    flexWrap: 'wrap',
                  },
                  children: title,
                },
              },

              // Authors
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 23,
                    fontWeight: 600,
                    color: ACCENT,
                    fontFamily: 'Inter',
                    marginBottom: 14,
                    display: 'flex',
                  },
                  children: authors,
                },
              },

              // Divider
              {
                type: 'div',
                props: {
                  style: {
                    height: 1,
                    background: BORDER,
                    marginBottom: 14,
                    display: 'flex',
                  },
                },
              },

              // Abstract
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 22,
                    color: TEXT_BODY,
                    fontFamily: 'Inter',
                    lineHeight: 1.65,
                    flex: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    overflow: 'hidden',
                  },
                  children: abstract,
                },
              },

              // Keywords
              keywords.length > 0 ? {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 7,
                    marginTop: 16,
                  },
                  children: keywords.map(kw => ({
                    type: 'div',
                    props: {
                      style: {
                        padding: '5px 16px',
                        borderRadius: 14,
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        fontSize: 17,
                        color: '#0369a1',
                        fontFamily: 'Inter',
                        display: 'flex',
                      },
                      children: String(kw),
                    },
                  })),
                },
              } : null,

            ].filter(Boolean),
          },
        },
      ],
    },
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function generatePng(paper) {
  const element = buildCard(paper);
  const svg = await satori(element, { width: W, height: H, fonts: FONTS });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } });
  return resvg.render().asPng();
}

async function main() {
  const papersPath = join(root, 'src/content/papers.json');
  const papers     = JSON.parse(readFileSync(papersPath, 'utf-8'));
  const preview    = process.argv.includes('--preview');

  if (preview) {
    const paper = papers.find(p => p.abstract && p.slug) || papers[0];
    const png   = await generatePng(paper);
    const outArg = process.argv.find(a => a.startsWith('--out='));
    const out   = outArg ? join(root, 'public', outArg.slice(6)) : join(root, 'public/og-preview.png');
    writeFileSync(out, png);
    console.log(`Preview written to ${out} (${paper.slug})`);
    return;
  }

  const outDir = join(root, 'public/og');
  mkdirSync(outDir, { recursive: true });

  const total = papers.length;
  console.log(`Generating OG images for ${total} papers…`);
  let done = 0;

  for (const paper of papers) {
    const slug = paper.slug;
    if (!slug) continue;
    const png = await generatePng(paper);
    writeFileSync(join(outDir, `${slug}.png`), png);
    done++;
    if (done % 50 === 0 || done === total) {
      process.stdout.write(`  ${done}/${total}\n`);
    }
  }

  console.log(`Done. OG images written to public/og/`);
}

main().catch(e => { console.error(e); process.exit(1); });
