# TEDx event website: first implementation

React, TypeScript, Vite, Tailwind and GSAP. Planning documents are CONTENT.md, DESIGN.md and IMPLEMENTATION.md in the parent workspace.

## Develop

```sh
npm install
npm run dev
```

## Verify and build

```sh
npm run typecheck
npm run build
npm run preview
```

The build prerenders all ES/EN landing, About, Partners and prototype routes. It does not require a running API. Root serves the Spanish landing. Preview output is noindex. Configure SITE_ORIGIN for a different deployment origin.

## Review routes

- `/es/` and `/en/`: landing.
- `/es/partners/` and `/en/partners/`: collaboration and mock contact.
- `/es/about/` and `/en/about/`: draft About content and the organizers listed on TED.com.
- `/es/prototype/` and `/en/prototype/`: isolated wordmark animation with replay and speed controls.

All forms are explicitly authorized demonstrations. No submitted values are sent, logged or saved persistently. The success message states that nothing was saved. Replace services/forms.ts and event.signupMode when real providers are chosen. In-memory form drafts survive language switching and disappear on reload. Intro completion uses session storage but stores no submitted data.

## Artwork and public-launch work

- The event name, date and public access come from https://www.ted.com/tedx/events/68819. License, university permissions and audience eligibility were confirmed by the organizer.
- Current lettering is generated prototype geometry using Inter, not an approved final event logo. The header text lockup is also a prototype. Replace both with the approved vector artwork and verify the animated treatment. The included Python generator requires fontTools and uses the installed Inter WOFF; it is not needed for routine builds because generated geometry is committed.
- Homepage and About explanations are original draft summaries. Insert the prescribed official homepage/About material and reviewed Spanish version before public launch; the presence of these draft pages is not a claim of full TEDx compliance. The required English footer statement and TEDx program link are present.
- Programme hours, thematic summaries, final venue arrangements, accessibility, speaker lineup and ticket details still require the stated content confirmations. No candidate speakers or speculative sponsor logos are shipped.
- Add the actual signup/contact destinations and privacy content before collecting data. No analytics or trackers are installed.
- The visible development badge, prototype routes and noindex metadata are intentional for this private development version. Review them before a public launch.

## Animation

The SVG starts in a complete static state. GSAP adds per-contour light trails, acceleration and an inward expanding boundary mask, then restores the static fill. Skip, reduced motion and a bounded recovery timeout use the same final-state function. The intro is not a blocking overlay. It plays once per tab session; the isolated prototype can replay it.

The default 0.25× sequence runs for 3 seconds and holds black interiors with faint steady outlines/halo for 1 second (the hold is independent of playback speed), then adds brighter traveling highlights and short fading tails, accelerates across a 1.2-second contour phase to the same explicit top speed as the former 14-second contour version, reaching it after 0.9 seconds and maintaining it through the outline crossfade, fills inward and removes the halo completely. Prototype geometry uses Inter 900 for TEDx and Inter 400 for the university name. Hold and motion review captures are in review/animation-hold.jpg and review/animation-moving.jpg.

The landing now opens with only the wordmark in a full-height stage. Metadata, central message and actions begin below the first viewport. Its fixed header slides/fades into view after scrolling starts and hides again at the top; supporting pages retain a normal visible header. The development badge also stays hidden on the initial screen. Screenshots: review/landing-opening.jpg, review/landing-opening-mobile.jpg and review/landing-scrolled.jpg. Desktop/mobile checks confirmed the supporting section starts exactly below the first viewport, with no horizontal overflow, and that the mobile menu works after the header enters.

## Repository and hosting

The website repository is https://github.com/JorgeRguezz/TEDxUPM. GitHub source synchronization is authorized. Planning documents and source PDFs remain in the parent local workspace. Generated builds, dependencies, local hosting metadata and review screenshots are excluded from Git.

**Hosting remains local-only.** Authorization to push source to GitHub does not authorize deployment. Do not synchronize with Sites hosting or publish the website unless the organizer requests it. Any `.openai/hosting.json` in the local checkout is ignored local metadata; preserve it locally without committing it.

## First-pass verification

- TypeScript check and client/server production builds passed.
- All eight locale/page combinations were checked for prerendered content, required footer and Partners navigation; both homepages include the TEDx program link and omit candidate speakers and speculative sponsor brands.
- Browser review covered desktop, 390 px mobile and 320 px narrow layouts, the mobile menu, ES/EN navigation, animation completion, replay/skip and both explicitly mocked submission flows. No console warnings/errors were reported in that review.
- Real-device performance, additional browser engines and OS reduced-motion changes have not yet been verified. Reduced-motion handling is implemented, but should be exercised before public launch.
- Review screenshot: `review/landing-mobile.jpg`. This is a narrow desktop-browser viewport, not a real-phone capture.

The completed landing intro now reveals a bottom-centered red circle with a white down arrow, using the actual wordmark completion callback. It has a soft glow and a thin red single-line SCROLL DOWN label above it. It is non-clickable, grows into view, then expands/fades away on the first scroll; reduced motion uses a static hint that hides on scroll. Scrolling before completion suppresses it.

A 3 px TED-red progress line runs along the landing header's bottom edge and fills with total page scroll. The header and line remain hidden on the untouched opening screen. Browser checks confirmed zero progress at the top, intermediate fill while scrolling, full fill at the footer, and the completed intro's centered arrow reveal. The scroll prompt was absent while the intro was still running.

The scroll label uses Inter 200 with no wrapping. The hint sits 48 px plus the bottom safe-area inset above the viewport edge to keep its circle and glow fully visible.

All page footers include: designed by Jorge Rodríguez, TelecoEmprende.
