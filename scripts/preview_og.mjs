// One-off script to preview what the OG image will look like.
// Run: node scripts/preview_og.mjs
// Output: public/og-preview.png

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ── Sample paper ────────────────────────────────────────────────────────────
const paper = {
  title: 'Loan word adaptation and vowel harmony in Turkish: a government phonology account',
  authors: ['Semra Baturay'],
  year: 2012,
  edition: 'ConSOLE 20',
  abstract: 'This study aims at investigating the adaptation of the loan words in Turkish and their relation to vowel harmony. I specifically focus on the loan words with final and initial consonant clusters within the framework of Government Phonology proposed in Kaye, Lowenstamm & Vergnaud (1990).',
  keywords: ['Loan Words', 'Vowel Harmony', 'Government Phonology', 'Turkish'],
};

// ── Fonts ────────────────────────────────────────────────────────────────────
function loadFont(path) {
  return readFileSync(path).buffer;
}

async function main() {
  const interRegular   = loadFont(join(root, 'scripts/fonts/inter-400.ttf'));
  const interSemiBold  = loadFont(join(root, 'scripts/fonts/inter-600.ttf'));
  const crimsonRegular = loadFont(join(root, 'scripts/fonts/crimson-400.ttf'));

  // ── Layout constants ───────────────────────────────────────────────────────
  const W = 1200;
  const H = 630;
  const PRIMARY = '#1e3a8a';
  const ACCENT = '#3b82f6';
  const BG = '#ffffff';
  const TEXT_SECONDARY = '#6b7280';
  const BORDER = '#e5e7eb';

  const title = paper.title.length > 90
    ? paper.title.slice(0, 87) + '…'
    : paper.title;

  const abstract = paper.abstract.length > 220
    ? paper.abstract.slice(0, 217) + '…'
    : paper.abstract;

  const authors = paper.authors.join(', ');
  const keywords = (paper.keywords || []).slice(0, 5);

  // ── JSX element tree ───────────────────────────────────────────────────────
  const element = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: W,
        height: H,
        background: BG,
        fontFamily: 'Inter',
        position: 'relative',
        overflow: 'hidden',
      },
      children: [

        // Top accent bar
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

        // Left blue sidebar stripe
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0, left: 0, bottom: 0,
              width: 8,
              background: PRIMARY,
              display: 'flex',
            },
          },
        },

        // Main content area
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              padding: '52px 72px 44px 80px',
              gap: 0,
            },
            children: [

              // Header row: SOLE Archive badge + edition
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 28,
                  },
                  children: [
                    // SOLE Archive label
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                background: PRIMARY,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              },
                              children: [
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      color: '#fff',
                                      fontSize: 18,
                                      fontWeight: 600,
                                      fontFamily: 'Inter',
                                      display: 'flex',
                                    },
                                    children: 'S',
                                  },
                                },
                              ],
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                              },
                              children: [
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      fontSize: 15,
                                      fontWeight: 600,
                                      color: PRIMARY,
                                      fontFamily: 'Inter',
                                      display: 'flex',
                                    },
                                    children: 'SOLE Archive',
                                  },
                                },
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      fontSize: 12,
                                      color: TEXT_SECONDARY,
                                      fontFamily: 'Inter',
                                      display: 'flex',
                                    },
                                    children: 'ConSOLE Proceedings',
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },

                    // Edition + year pill
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                padding: '4px 14px',
                                borderRadius: 20,
                                background: '#eff6ff',
                                border: `1px solid #bfdbfe`,
                                fontSize: 13,
                                fontWeight: 600,
                                color: PRIMARY,
                                fontFamily: 'Inter',
                                display: 'flex',
                              },
                              children: paper.edition,
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: 13,
                                color: TEXT_SECONDARY,
                                fontFamily: 'Inter',
                                display: 'flex',
                              },
                              children: String(paper.year),
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
                    fontSize: 34,
                    fontWeight: 400,
                    color: PRIMARY,
                    fontFamily: 'Crimson Text',
                    lineHeight: 1.25,
                    marginBottom: 16,
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
                    fontSize: 15,
                    fontWeight: 600,
                    color: ACCENT,
                    fontFamily: 'Inter',
                    marginBottom: 16,
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
                    marginBottom: 16,
                    display: 'flex',
                  },
                },
              },

              // Abstract
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 14,
                    color: '#374151',
                    fontFamily: 'Inter',
                    lineHeight: 1.6,
                    flex: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                  },
                  children: abstract,
                },
              },

              // Keywords row
              keywords.length > 0 ? {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginTop: 18,
                  },
                  children: keywords.map(kw => ({
                    type: 'div',
                    props: {
                      style: {
                        padding: '3px 12px',
                        borderRadius: 12,
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        fontSize: 12,
                        color: '#0369a1',
                        fontFamily: 'Inter',
                        display: 'flex',
                      },
                      children: kw,
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

  const svg = await satori(element, {
    width: W,
    height: H,
    fonts: [
      { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
      { name: 'Inter', data: interSemiBold, weight: 600, style: 'normal' },
      { name: 'Crimson Text', data: crimsonRegular, weight: 400, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } });
  const png = resvg.render().asPng();

  const out = join(root, 'public', 'og-preview.png');
  writeFileSync(out, png);
  console.log(`Preview written to: ${out}`);
}

main().catch(e => { console.error(e); process.exit(1); });
