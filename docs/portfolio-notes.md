# Portfolio notes

Internal checklist. Keep claims factual: add numbers, screenshots and quotes only once they are verified.

## Before going public (things only you can supply)

- [ ] **Real screenshots.** Run `python3 scripts/capture_screenshots.py` on your own machine (setup is in the script header). Pass `--url jm-cab-services=https://...` and `--url shalom-designs=https://...` once those are live. The SVG artwork stays as the automatic fallback.
- [ ] **A photo of you.** Save it as `assets/img/landon.webp` (4:5, about 800x1000), then in `index.html` change the About image `src` from `landon-placeholder.svg` to `landon.webp` and give it real alt text.
- [ ] **Your own OG image.** Replace `assets/img/og-image.png` (1200x630). A generated one is in place.
- [ ] **Final domain.** Canonical, OG, JSON-LD, sitemap and robots currently use `https://landoncarterwindvogel.dev`. If it differs: `python3 scripts/set_domain.py https://your-domain`.
- [ ] **Netlify.** Connect the repo, enable Forms (the contact form uses `data-netlify`), add the domain. Send yourself a test enquiry.
- [ ] **Testimonials.** Add one real quote per project when you have it (snippet below).
- [ ] **Measured results.** For each case study add one verified number: Lighthouse scores, load time, enquiries before/after. Put it in a new `case-block` in `projects/*.html`.
- [ ] **Lighthouse + a real phone.** Aim for 95+ across the board, then test on your S21+ with keyboard and screen reader.

## Testimonial snippet

Add this section to `index.html` between the Process and About sections, and add `<a href="#proof">Proof</a>` to the nav if you want it linked. Only publish quotes you have permission to use.

```html
<section class="section" id="proof" aria-labelledby="proof-title"><div class="shell">
  <div class="section-head reveal"><h2 id="proof-title">What clients say</h2></div>
  <blockquote class="reveal">
    <p>“Quote here, one or two sentences.”</p>
    <footer>Name, business</footer>
  </blockquote>
</div></section>
```

(Style it with a large `p` and a `--muted` footer; the tokens are in `assets/css/site.css`.)

## Order of work on the home page

1. Paivepo Art & Decor
2. BL&N Electrical & Plumbing
3. JM Cab Services
4. PostNet Production
5. Shalom Designs
