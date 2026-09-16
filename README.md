# Landon Carter Windvogel — Portfolio

![Status](https://img.shields.io/badge/status-in%20development-111111?style=flat-square)
![Stack](https://img.shields.io/badge/stack-HTML%20%2B%20CSS%20%2B%20JavaScript-111111?style=flat-square)
![Deployment](https://img.shields.io/badge/deployment-Netlify-111111?style=flat-square&logo=netlify&logoColor=white)

A personal portfolio website for **Landon Carter Windvogel**, focused on polished, accessible, performant websites built with semantic HTML, modern CSS and vanilla JavaScript.

The portfolio is intentionally built from the same principles used on client work: clean architecture, responsive layouts, accessibility, SEO foundations, performance and maintainable code — without a frontend framework.

## Featured work

| Project | Status | Focus |
| --- | --- | --- |
| **Paivepo Art & Decor** | Featured | Luxury art & decor / visual storytelling |
| **BL&N Electrical & Plumbing** | Live project | Local service business / lead generation |
| **JM Cab Services** | Next | Service business / customer conversion |
| **Shalom Designs** | In progress | Ecommerce / school & lifestyle products |

## Repository structure

```text
.
├── assets/
│   ├── css/
│   │   └── main.css
│   ├── images/
│   └── js/
│       └── main.js
├── projects/
│   ├── paivepo.html
│   ├── bln-electrical.html
│   ├── jm-cab-services.html
│   └── shalom-designs.html
├── docs/
├── 404.html
├── about.html
├── contact.html
├── index.html
├── netlify.toml
├── robots.txt
└── README.md
```

## Design direction

The portfolio should feel more like an independent digital studio than a collection of client-site templates. The visual system is deliberately editorial and minimal, with strong typography, generous spacing, restrained motion and project-led storytelling.

### Principles

- **Vanilla first** — no React, Vue or Angular.
- **Semantic HTML** — structure content for people, search engines and assistive technology.
- **Mobile first** — layouts scale upward rather than being patched for mobile later.
- **Performance aware** — keep dependencies, JavaScript and media weight under control.
- **Accessible by default** — keyboard navigation, visible focus, readable contrast and meaningful landmarks.
- **Secure by design** — avoid unsafe HTML injection, keep third-party code to a minimum and apply appropriate security headers at deployment.
- **SEO ready** — intentional titles, descriptions, canonical URLs, Open Graph metadata and structured data as each page is completed.

## Current portfolio order

1. **Paivepo Art & Decor** — first featured project.
2. **BL&N Electrical & Plumbing** — local-service business website.
3. **JM Cab Services** — upcoming case study.
4. **Shalom Designs** — current ecommerce rebuild and redesign project.

The portfolio will grow as new work is completed. Project pages are separated from the homepage so the homepage can remain a concise introduction while each case study can become substantially deeper over time.

## Development

This is a static site and can be run locally without a build step:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

The site is intended for GitHub → Netlify continuous deployment. Keep production secrets out of the repository and use Netlify environment variables for anything that should not be public.

## License

The website and portfolio content are personal work by Landon Carter Windvogel. Client logos, photography, artwork and other third-party assets remain the property of their respective owners unless otherwise stated.
