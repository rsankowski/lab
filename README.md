# Sankowski Lab website

A static site with no build step: open `index.html` in a browser, or host the folder anywhere (GitHub Pages, Netlify, your institute's server).

```
index.html          Home: hero, metrics, research focus, recent papers, latest posts
team.html           Team
publications.html   Publications with search, filter, sort and live metrics
blog.html / post.html
data/               ← everything you edit lives here
assets/img/         hero image + team photos
```

## Editing content

| What | Where |
|---|---|
| Lab name, tagline, intro, email, research areas, IDs | `data/config.js` |
| Title-page picture | `assets/img/hero.png`; set the path and caption in `data/config.js` |
| Team | `data/team.js` (photos in `assets/img/team/`) |
| Blog posts | add an entry to `data/blog.js` and a body file `blog/posts/<slug>.js` (copy `welcome.js`) |

## Metrics & publications

- **Live (default):** metrics and the publication list come from [OpenAlex](https://openalex.org), using the ORCID in `config.js` (0000-0001-9215-8021). It's free and needs no key. Data is cached in the visitor's browser for 6 hours. If OpenAlex can't be reached, the site shows the snapshot in `METRICS_FALLBACK`.
- **Web of Science:** WoS profile pages need a login and can't be read from a public site, so every metrics block links to your [WoS profile](https://www.webofscience.com/wos/author/record/JWP-0390-2024). To show WoS numbers on the site instead:
  1. Get a free *Web of Science Starter API* key at <https://developer.clarivate.com>.
  2. Run `WOS_API_KEY=... python3 scripts/fetch_wos_metrics.py`. This writes `data/wos-metrics.js`, and the site then shows WoS citations, h-index and publication count.
  3. To refresh automatically on GitHub: add the repo secret `WOS_API_KEY` and the repo variable `WOS_ENABLED=true`. The workflow in `.github/workflows/update-metrics.yml` then runs every Monday.

## Design

Swiss / International Typographic Style: 12-column grid, Futura for headlines and Helvetica Neue Light for text (system fonts on Apple devices; Jost and Inter Light load from Google Fonts as look-alikes elsewhere), black and white with one carmine accent, numbered sections. All colours are CSS variables at the top of `assets/css/style.css`; change `--red` (carmine, `#b0123a`) to re-theme the whole site.

## Deploying on GitHub Pages

Push to GitHub → Settings → Pages → Source: *Deploy from branch* → `main` / root.
