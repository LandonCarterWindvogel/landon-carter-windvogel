# Landon Carter Windvogel — Portfolio

![Status](https://img.shields.io/badge/status-in%20development-111111?style=flat-square)
![Stack](https://img.shields.io/badge/stack-HTML%20%2B%20CSS%20%2B%20JavaScript-111111?style=flat-square)
![Deployment](https://img.shields.io/badge/deployment-Netlify-111111?style=flat-square&logo=netlify&logoColor=white)

Personal portfolio for **Landon Carter Windvogel**, a digital & technology studio based in Plettenberg Bay, South Africa.

The site showcases selected client work, digital products and ongoing experiments. It is intentionally built without a frontend framework: semantic HTML, modern CSS and vanilla JavaScript are the foundation.

## Portfolio direction

The portfolio is designed to feel more like an independent digital studio than a collection of template sites. The homepage stays focused and editorial, while individual projects are documented as deeper case studies.

### Current project order

| # | Project | Status | Focus |
| --- | --- | --- | --- |
| 01 | **Paivepo Art & Decor** | Featured · Pre-launch | Art, decor & visual storytelling |
| 02 | **BL&N Electrical & Plumbing** | Live | Local service business & lead generation |
| 03 | **JM Cab Services** | Live | Conversion-focused service website |
| 04 | **Shalom Designs** | In development | Ecommerce, catalogue UX & redesign |

**PostNet Production** is presented separately as an internal digital product rather than as a client case study.

## Repository structure

```text
.
├── assets/
│   ├── css/
│   ├── images/
│   └── js/
├── projects/
│   ├── paivepo.html
│   ├── bln-electrical.html
│   ├── jm-cab-services.html
│   └── shalom-designs.html
├── docs/
├── 404.html
├── index.html
├── netlify.toml
├── robots.txt
├── .editorconfig
├── .gitignore
└── README.md
```

## Engineering principles

- **Vanilla first** — no React, Vue or Angular for the portfolio frontend.
- **Semantic HTML** — meaningful structure for people, search engines and assistive technology.
- **Mobile first** — responsive layouts are designed from small screens upward.
- **Performance aware** — minimise unnecessary dependencies, JavaScript and media weight.
- **Accessible by default** — keyboard support, visible focus, reduced-motion handling and clear landmarks.
- **Secure by design** — no unsafe HTML injection, minimal third-party dependencies and deployment security headers.
- **SEO ready** — intentional titles, descriptions, canonical URLs, Open Graph metadata and structured data.
- **Maintainable** — prefer clear, boring architecture over unnecessary abstraction.

## Development

This is a static site and does not require a build step for the portfolio itself.

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deployment

The intended deployment flow is:

```text
VS Code → Git → GitHub → Netlify
```

Pushes to the `main` branch can trigger the production deployment once the repository is connected to Netlify.

Production secrets must never be committed to the repository. Use Netlify environment variables or another appropriate secret store for anything that should remain private.

## Case studies

Project pages are kept separate from the homepage so each case study can grow into a proper piece of portfolio documentation containing:

- project context and client objective
- design direction and information architecture
- selected implementation details
- responsive and accessibility decisions
- screenshots and visual evidence
- technology stack
- live project link where appropriate

## Assets and ownership

Client logos, photography, artwork, copy and other third-party materials remain the property of their respective owners unless otherwise stated. Portfolio usage should respect client permissions and asset licensing.

© Landon Carter Windvogel
