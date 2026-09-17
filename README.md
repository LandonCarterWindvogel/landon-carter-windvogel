# Landon Carter Windvogel — Portfolio

This is my personal portfolio. It is where I put the work I am actually proud of, explain what I built, and occasionally remind myself that apparently I enjoy writing HTML by hand.

I am based in Plettenberg Bay, South Africa, and my main focus is building clean, fast, accessible websites for real businesses. I work primarily with semantic HTML, modern CSS and vanilla JavaScript because I like understanding what my code is doing instead of adding a framework and hoping for the best.

![Status](https://img.shields.io/badge/status-in%20development-111111?style=flat-square)
![Stack](https://img.shields.io/badge/stack-HTML%20%2B%20CSS%20%2B%20JavaScript-111111?style=flat-square)
![Deployment](https://img.shields.io/badge/deployment-Netlify-111111?style=flat-square&logo=netlify&logoColor=white)

## What this portfolio is for

I am using this site to show how I approach real client work — not just how pretty I can make a landing page look.

Each project is meant to show some combination of design, UX, responsive development, accessibility, SEO, performance and the practical problems that come with building something a real person has to use.

### Projects

| # | Project | Status | What I am showing |
|---|---|---|---|
| 01 | **Paivepo Art & Decor** | Pre-launch | Premium art, decor and visual storytelling |
| 02 | **BL&N Electrical & Plumbing** | Live | Local business website and lead generation |
| 03 | **JM Cab Services** | Live | Conversion-focused service website |
| 04 | **Shalom Designs** | In development | Ecommerce, catalogue UX and redesign |

**PostNet Production** is documented separately because it is an internal production-management product rather than a client case study.

## How I build things

I keep coming back to a few rules because they make life easier later:

- **Vanilla first.** No React, Vue or Angular unless there is a genuinely good reason to use one.
- **Semantic HTML.** The markup should make sense before CSS and JavaScript arrive to decorate it.
- **Mobile first.** If it works beautifully on a small screen, I have somewhere sensible to start.
- **Accessibility is part of the build.** Keyboard navigation, focus states, landmarks and reduced-motion support are not optional polish.
- **Performance matters.** Fewer dependencies, sensible images and less JavaScript usually make everyone happier.
- **Security matters too.** I avoid unsafe HTML injection, keep third-party code to a minimum and use deployment security headers where appropriate.
- **SEO is built in.** Titles, descriptions, canonical URLs, structured data, Open Graph metadata and semantic content all have a job.
- **Keep the architecture boring.** If a simple solution works, I would rather use it than build a tiny software empire for one button.

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

The portfolio itself is intentionally a lightweight static site. The homepage stays focused, while the project pages give me room to document the work properly.

## Development

There is no frontend build system hiding behind the curtains here.

For a quick local preview:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

I develop in VS Code, keep the source in GitHub and deploy through Netlify.

## Deployment

My normal flow is:

```text
VS Code → Git → GitHub → Netlify
```

The `main` branch is the production branch once the repository is connected to Netlify.

I do not commit secrets to GitHub. Anything genuinely private belongs in Netlify environment variables or another appropriate secret store.

## Case studies

When I document a project, I want the case study to explain more than "here is a screenshot".

I use the project pages to capture things such as:

- the client's problem and objective
- the design direction
- information architecture and UX decisions
- implementation details
- responsive and accessibility decisions
- SEO and performance work
- relevant technology choices
- screenshots and visual evidence
- the live project where appropriate

## A note to future me

Do not add complexity just because the internet has invented another clever way of doing something simple.

Read the existing code before changing it. Test on an actual phone. Check the keyboard. Check the console. Check the page speed. Check the HTML. Then, when everything works, resist the urge to rewrite it because you got bored.

That last one is probably the hardest.

## Ownership

Client logos, photography, artwork, copy and other third-party materials belong to their respective owners unless otherwise stated. I only use client assets in the portfolio where I have the appropriate permission or licence.

© Landon Carter Windvogel
