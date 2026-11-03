# SOLE Archive - Astro Edition

Academic digital archive and research discovery platform for ConSOLE proceedings - transforming linguistic research into an engaging, intelligent exploration experience.

## 🚀 Project Overview

SOLE Archive is a modern web application built with **Astro** that provides access to decades of ConSOLE (Conference on Student Language Research) proceedings. The platform features:

- **Intelligent Search**: Advanced search capabilities across papers, authors, and topics
- **Research Trends Dashboard**: Visual analytics of linguistic research evolution
- **Paper Browsing**: Comprehensive catalog of academic papers with metadata
- **Modern UI**: Beautiful, responsive design optimized for academic research

## 🛠️ Technology Stack

- **Framework**: [Astro](https://astro.build/) - Modern static site generator
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Fonts**: Google Fonts (Crimson Text, Inter, JetBrains Mono)
- **Icons**: Heroicons (SVG icons)
- **Deployment**: Static site hosting ready

## 📁 Project Structure

```
sole-archive/
├── src/
│   ├── components/     # Reusable Astro components
│   ├── layouts/        # Page layouts
│   ├── pages/          # Astro pages (routes)
│   └── styles/         # Global styles
├── public/             # Static assets
├── astro.config.mjs    # Astro configuration
├── tailwind.config.mjs # Tailwind CSS configuration
└── package.json        # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sole-archive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:4321` to view the application

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run astro` - Run Astro CLI commands

## 🎨 Design System

### Color Palette

- **Primary**: Deep academic blues (#1e3a8a) - Trustworthy research foundation
- **Secondary**: Interface hierarchy support (#1e40af)
- **Accent**: Warm amber (#f59e0b) - Discovery moments
- **Background**: Pure white (#fefefe) - Optimal reading canvas
- **Text**: Near black (#1f2937) - Extended reading comfort

### Typography

- **Headlines**: Crimson Text (serif) - Scholarly gravitas
- **Body**: Inter (sans-serif) - Modern readability
- **Accents**: JetBrains Mono (monospace) - Technical metadata

## 📄 Pages

1. **Homepage** (`/`) - Main landing page with search and featured papers
2. **Papers** (`/papers`) - Browse all research papers with filtering
3. **Research Trends** (`/research-trends`) - Analytics dashboard

## 🔧 Customization

### Adding New Pages

1. Create a new `.astro` file in `src/pages/`
2. Import the Layout component
3. Add your content using the established design patterns

### Modifying Styles

- Global styles are in `src/layouts/Layout.astro`
- Component-specific styles use Tailwind CSS classes
- Custom CSS can be added to the `<style>` section of any component

### Updating Content

- Paper data is currently static (can be converted to dynamic data sources)
- Images and assets are in the `public/` directory
- Text content is directly in the Astro components

## 📅 Yearly update (adding a new volume)

1. **Add the new papers** to `src/content/papers.json`.
2. **Build locally:** `npm run prebuild`. This copies the data, computes related papers, regenerates the share images, and checks map coverage. Statistics, charts, featured papers and the "2000 – *latest year*" ranges all update from `papers.json` automatically.
3. **Read the `[map]` lines in the output.** Any venue or affiliation listed there has no coordinates and will **not** appear on the map. For each one, either:
   - it's a spelling variant of a name already on the map (e.g. `Universität Leipzig`): add it to `affiliationNormalization` (or `venueNormalization`) in `src/content/locations.json`, mapped to the existing name; or
   - it's not a place (e.g. a funding body): map it to `""` in `affiliationNormalization` to hide it; or
   - it's a genuinely new place: run the geocoder (next step).
4. **Geocode new places:** `python scripts/geocode_locations.py`. It looks each missing name up on OpenStreetMap and writes suggestions to `"pending"` in `locations.json`. Pending entries are not shown on the map yet.
5. **Review `"pending"`.** Check each `osm_match`; OpenStreetMap sometimes picks the wrong place (e.g. *Via Alicante* in San Diego, a satellite campus abroad). Fix wrong `coords` by hand as `[lat, lon]`, e.g. from Google Maps.
6. **Accept:** `python scripts/geocode_locations.py --accept` moves the reviewed entries onto the map. Re-run `npm run prebuild` and confirm it prints `All venues and affiliations have coordinates.`
7. Commit and push.

`python scripts/geocode_locations.py --list` lists missing names without changing anything. To make the build fail when something is missing, set `SOLE_STRICT_LOCATIONS=1` or run `python scripts/affiliation_checker.py --strict`.

The map code in `src/pages/analytics.astro` never needs editing: it reads everything from `src/content/locations.json`.

## 🚀 Deployment

### Static Site Hosting

The project builds to static files, making it compatible with:

- **Netlify**: Connect your repository for automatic deployments
- **Vercel**: Deploy with zero configuration
- **GitHub Pages**: Host directly from your repository
- **Any static hosting service**

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📊 Features

### Search Functionality
- Real-time search suggestions
- Filter by ConSOLE edition, topic, or author
- Advanced search capabilities

### Research Analytics
- Trending research areas visualization
- Publication timeline charts
- Geographic distribution of research
- Emerging trends analysis

### Paper Management
- Comprehensive paper metadata
- Citation tracking
- Author profiles
- PDF download links

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- ConSOLE conference organizers
- Linguistic research community
- Open source contributors

---

**Built with ❤️ for the linguistic research community**
