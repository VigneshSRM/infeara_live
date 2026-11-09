# Infeara Website Image Redesign — Audit & Replacement Map

**Status:** Pre-implementation audit (saved before changing any image asset, reference, alt text, or loading behavior).  
**Scope:** Public marketing pages and reusable public components under `app/` and `components/site/`. Admin media previews and official brand marks are audited as protected/non-redesign assets.  
**Design constraints:** preserve layout and behavior; keep the official logo unchanged; approved brand UI colors are ivory `#EAE6DE`, blue `#226192`, coral `#EF8557`; photographic imagery may retain natural colors. No placeholders, watermarks, AI logos, irrelevant stock concepts, image reuse across sections, or infographic reuse.

## Audit findings

- Public raster/photo inventory: 38 files under `public/site/` (JPEG). Existing assets are content-labeled but mix broad stock-photo concepts with more specific service/industry photos.
- Existing mapping logic in `lib/site-images.ts` contains a semantic photo registry, numeric `figureSeeds`, named `schematicLabels`, a sector-caption lookup, and hash-based fallback selection. The fallback and shared registry make distinctness non-deterministic from a content-audit perspective and allow unrelated sections to land on the same photo.
- `Figure` is used by service, subservice, industry, article, company, contact, careers, legal, and other public pages. `Schematic` adds another photographic instance, often on the same route. Core/service/industry cards use `PhotoTile`; hero image tiles preload while general image components use Next Image. Two content subservice templates contain unique inline SVG infographics with explicit intrinsic dimensions and lazy loading.
- Known existing cross-context reuse in seed map: `server-room` (seeds 3, 5, 57, 101), `client-meeting` (4, 8, 17, 31, 71, 91, 141), `operations-centre` (1, 21, 41, 56, 81, 111), `network-cabinet` (6, 58, 13), `runbook-desk` (7, 121, 131, 139, 151), `banking-office` (11, 18, 137), and repeated `Figure`/`Schematic` use of these same sources. Schematic label mappings and sector service-map mappings also reuse photos, including some same-page pairs. The current code comments explicitly describe “photographic library” mapping, so replacing only a few filenames would not remove these collisions.
- The public pages use some non-photographic, functionally informative visuals: the 14 named subservice infographics and the homepage how-we-work circular diagrams (desktop and mobile). These are distinct per named subservice and responsive variants of one diagram, respectively. Preserve the logo and circular process infographic’s purpose; audit their palette/labels separately during QA. Do not treat them as decorative photography or substitute generic imagery.

## Old-to-new asset map

Each old photo is assigned one content-specific replacement concept and a unique target asset name. The replacement is planned as a bespoke single image (not a collage); concepts specify subject, framing, and visual treatment to keep assets distinct. All targets will be delivered as optimized WebP with a suitable responsive source/dimensions. Unless identified as a hero, below-fold use should lazy-load. The official brand assets are intentionally not included in this replacement list.

| Existing asset | Main current context | Planned unique replacement asset / visual brief |
|---|---|---|
| `homepage-hero.jpg` | Homepage primary hero / seed 10 | `home-hero.webp` — wide documentary view of an Indian IT engineer at a server cabinet, human subject on right with quiet negative space left, natural daylight, calm enterprise realism. |
| `core-it-infrastructure.jpg` | IT infrastructure service card | `service-it-infrastructure.webp` — close, precise hands-on fiber patching in an organized rack, diagonal cable detail, no readable screens. |
| `core-cybersecurity.jpg` | Cybersecurity service card | `service-cybersecurity.webp` — analyst in profile at a restrained security operations desk, monitor glow, candid over-shoulder composition. |
| `core-cloud-datacenter.jpg` | Cloud and datacenter service card | `service-cloud-datacenter.webp` — symmetrical data-center aisle with strong vanishing point and no visible person. |
| `core-turnkey-projects.jpg` | Turnkey projects service card | `service-turnkey-projects.webp` — field engineers planning a network installation over a physical floor plan, overhead composition. |
| `core-ai-automations.jpg` | AI Automations service card / seed 19 | `service-ai-automations.webp` — operations specialist tracing an automated workflow on a paper process map with a laptop, editorial tabletop view. |
| `core-application-development.jpg` | Application Development service card / seed 20 | `service-application-development.webp` — developer pair reviewing a product prototype on a large monitor, clean studio-office side view. |
| `ai-chatbot-development.jpg` | AI chatbot subservice | `subservice-ai-chatbot.webp` — product designer testing a chat interface on a laptop, interface unreadable, close crop. |
| `ai-callers-development.jpg` | AI voice callers subservice | `subservice-ai-voice-callers.webp` — headset-wearing QA specialist in a bright acoustic booth testing a call flow, portrait composition. |
| `llm-development.jpg` | LLM engineering subservice | `subservice-llm-engineering.webp` — researcher annotating model evaluation charts on paper beside workstation, top-down desk still life. |
| `it-infrastructure-ai-automations.jpg` | Infrastructure AI automation | `subservice-infrastructure-automation.webp` — engineer at a real rack checking a tablet-based maintenance checklist, wide three-quarter angle. |
| `web-application-development.jpg` | Web application subservice | `subservice-web-application.webp` — interface wireframes and code review in a small product team, candid side-lit meeting. |
| `website-development.jpg` | Website development subservice | `subservice-website.webp` — designer comparing responsive page layouts on a tablet and laptop, uncluttered overhead composition. |
| `mobile-application-development.jpg` | Mobile app subservice | `subservice-mobile-app.webp` — hands testing a neutral smartphone prototype in natural light, tight detail with no visible brand. |
| `cloud-ai-data.jpg` | Cloud AI and data services | `cloud-ai-data.webp` — data engineer discussing a physical data-flow sketch beside a laptop, human-centered editorial frame. |
| `managed-cloud-support.jpg` | Managed cloud support | `cloud-managed-support.webp` — engineer checking a monitoring wall in a bright operations room, landscape establishing shot. |
| `cloud-cost-optimization.jpg` | Cloud cost optimization | `cloud-cost-optimization.webp` — close-up of notebook, calculator, and laptop with abstract resource charts, still-life composition. |
| `cloud-disaster-recovery.jpg` | Disaster recovery / continuity | `cloud-disaster-recovery.webp` — technician testing a backup appliance in a secondary site, strong foreground equipment. |
| `cloud-monitoring-management.jpg` | Cloud monitoring | `cloud-monitoring.webp` — operations engineer at a standing desk reviewing service-health screens, profile composition. |
| `cloud-application-hosting.jpg` | Application hosting | `cloud-app-hosting.webp` — compact application deployment setup, engineer connecting a network appliance, clean technical detail. |
| `cloud-devops-automation.jpg` | DevOps automation | `cloud-devops.webp` — two engineers reviewing a release checklist on a whiteboard, dynamic horizontal framing. |
| `cybersecurity-hub.jpg` | Cybersecurity hub page | `cybersecurity-hub.webp` — secure office entry with analyst badge-checking at the threshold, environmental wide shot. |
| `vulnerability-assessment.jpg` | Vulnerability assessment | `security-vulnerability-review.webp` — assessor documenting a controlled equipment inspection with checklist, documentary close crop. |
| `penetration-testing.jpg` | Penetration testing | `security-penetration-test.webp` — authorized tester using an isolated test workstation with notebook, no hacker tropes or readable code. |
| `threat-modeling.jpg` | Threat modeling | `security-threat-modeling.webp` — architects mapping system boundaries on glass with sticky-note-free simple line sketches. |
| `threat-analysis.jpg` | Threat analysis | `security-threat-analysis.webp` — analyst comparing a printed incident timeline with a security dashboard, editorial desk perspective. |
| `noc-monitoring.jpg` | Managed IT / monitoring / NOC seed | `managed-it-operations.webp` — small daytime service desk team coordinating incident response, human-led and approachable. |
| `server-room.jpg` | Infrastructure, cloud, partners and other reused figure contexts | `infrastructure-data-center.webp` — close portrait of a technician verifying a rack status indicator, distinct from wide cloud aisle. |
| `plant-network.jpg` | Industrial network and infrastructure contexts | `manufacturing-network.webp` — factory-floor network cabinet beside production equipment, natural industrial light. |
| `runbook-desk.jpg` | Runbooks, FAQ, careers, legal and other reused contexts | `operations-runbook.webp` — engineer’s annotated maintenance notebook and pen beside a keyboard, overhead still life. |
| `client-meeting.jpg` | About, approach, contact, case studies and other reused contexts | `client-discovery.webp` — two people in a first discovery conversation at a small table, warm candid side profile. |
| `hospital-it.jpg` | Healthcare industry | `industry-healthcare-it.webp` — hospital IT professional supporting a nurse at a workstation, respectful clinical environment. |
| `warehouse-it.jpg` | Logistics industry | `industry-logistics.webp` — warehouse operator scanning inventory with a handheld terminal, layered aisle perspective. |
| `campus-lab.jpg` | Education industry | `industry-education.webp` — student lab with instructor helping a learner at a workstation, human-scale wide shot. |
| `store-pos.jpg` | Retail industry | `industry-retail.webp` — retail associate testing a point-of-sale terminal before opening, bright natural store light. |
| `bank-branch.jpg` | Banking and enterprise office industries (currently reused) | `industry-banking.webp` — bank operations specialist at a secure back-office workstation, close environmental portrait. |

### Existing infographic and protected-asset disposition

| Existing visual | Decision |
|---|---|
| `public/site/infographics/{ai-callers-development,ai-chatbot-development,cloud-ai-data-services,cloud-application-hosting,cloud-cost-optimization,cloud-devops-automation,cloud-disaster-recovery-business-continuity,cloud-monitoring-management,it-infrastructure-ai-automations,llm-development,managed-cloud-support-msp,mobile-application-development,web-application-development,website-development}.svg` | Keep each unique asset paired only with its own named service. Verify no duplicate references, content alt, palette, intrinsic aspect ratio, and lazy loading. These are explanatory diagrams, not replaceable photos. |
| `home-how-we-work-circles.svg`, `home-how-we-work-circles-mobile.svg` | Keep as the required responsive animated circular process infographic. Confirm desktop/mobile source selection, animation remains functional, and artwork uses approved brand colors only. |
| `public/brand/*` | Protected. Do not modify or replace official logos/icons. |
| Admin media thumbnails | Outside public redesign; preserve current admin behavior and private data handling. |

## Implementation contract

1. Generate each replacement as a distinct, relevant image; convert/compress originals to WebP and provide intrinsic dimensions/aspect-ratio stability. Use Next Image responsive `sizes`/srcset where applicable.
2. Replace collision-prone seed/label/hash routing with explicit per-page/per-section image identities. Do not use the same photo twice across distinct public sections, including a page’s Figure and Schematic, cards, or page templates. Repeated article content must get article-specific editorial images or a deliberate unique fallback per article.
3. Use descriptive, concise alt text that states the visible subject/action and context without keyword stuffing. Decorative visuals remain empty-alt/hidden only when genuinely decorative; retain textual equivalents for explanatory infographics.
4. Eagerly load only the actual LCP/hero image. Lazy-load below-fold images, include width/height and stable aspect ratios, and preserve crop/layout rules across breakpoints.
5. Verify paths and uniqueness mechanically, review all public image call sites and route families, run typecheck/build/HTTP tests, and exercise representative desktop/tablet/mobile pages at the existing port 3000 preview.

## Implementation progress (partial)

The audit was saved before implementation. The first 20 distinct images have now been generated and converted from PNG intermediates to optimized WebP, mostly at 1376×768 (the AI voice-caller asset is 768×1376). Original generation intermediates were removed after conversion; all 20 WebP files total about 2.5 MB, with each file below 220 KB. They replace or map to 20 of the audited image concepts.

| Generated asset | Implemented use | Alt text |
|---|---|---|
| `public/site/home-hero.webp` | Homepage hero (`app/page.tsx`) | IT engineer inspecting a server cabinet in a modern enterprise data room. |
| `public/site/service-it-infrastructure.webp` | IT Infrastructure service card | Infrastructure engineer's hands patching fiber-optic cables into an organized network rack. |
| `public/site/service-cybersecurity.webp` | Cybersecurity service card | Security analyst reviewing monitoring displays at a workstation. |
| `public/site/service-cloud-datacenter.webp` | Cloud & Datacenter service card | Symmetrical aisle of server racks in a modern data center. |
| `public/site/service-turnkey-projects.webp` | Turnkey Projects service card | Engineers planning an office network installation over a printed floor plan. |
| `public/site/service-ai-automations.webp` | AI Automations service card | Operations specialist mapping a workflow beside a laptop. |
| `public/site/service-application-development.webp` | Application Development service card | Software developers reviewing an application prototype together. |
| `public/site/subservice-ai-chatbot.webp` | AI chatbot image registry entry | Product designer testing a chatbot interface on a laptop during AI chatbot development. |
| `public/site/subservice-ai-voice-callers.webp` | AI voice-caller image registry entry | Quality specialist wearing a headset while testing a supervised AI voice-caller workflow. |
| `public/site/subservice-llm-engineering.webp` | LLM engineering image registry entry | Researcher annotating language-model evaluation charts beside a laptop. |
| `public/site/subservice-infrastructure-automation.webp` | Infrastructure AI automation page image registry entry | Infrastructure engineer checking a tablet maintenance checklist beside a server rack. |
| `public/site/subservice-web-application.webp` | Web application development page image registry entry | Product team reviewing web application wireframes and a workflow on a laptop. |
| `public/site/subservice-website.webp` | Website development page image registry entry | Designer comparing responsive website layouts on a tablet and laptop. |
| `public/site/subservice-mobile-app.webp` | Mobile application development page image registry entry | Hands testing a mobile application prototype on an unbranded smartphone. |
| `public/site/cloud-ai-data.webp` | Cloud AI and data services page image registry entry | Data engineer explaining a data-flow sketch beside a laptop. |
| `public/site/cloud-managed-support.webp` | Managed cloud support page image registry entry | Cloud operations engineer reviewing service-health dashboards in an operations room. |
| `public/site/cloud-cost-optimization.webp` | Cloud cost optimization page image registry entry | Notebook, calculator and laptop with abstract resource charts for cloud cost planning. |
| `public/site/cloud-disaster-recovery.webp` | Cloud disaster recovery page image registry entry | Technician verifying a backup storage appliance in a secondary server room. |
| `public/site/cloud-monitoring.webp` | Cloud monitoring page image registry entry | Operations engineer reviewing cloud service-health screens at a standing desk. |
| `public/site/cloud-app-hosting.webp` | Cloud application hosting page image registry entry | Platform engineer connecting a network appliance on a clean equipment bench. |

Seven assets are referenced by the homepage/core-service-card catalog; thirteen are mapped in the semantic registry for AI, application-development and cloud subservice detail pages. `PhotoTile` uses Next Image `fill` with stable aspect-ratio wrappers and responsive sizes; the homepage hero has intrinsic 1200×675 dimensions and is preloaded. All 20 WebP URLs returned HTTP 200 with `image/webp` content type after rebuilding and restarting the port 3000 preview. Typecheck and production build passed; HTTP smoke tests passed 6/6; `git diff --check` passed. The layout has not been intentionally changed. Full page-family image distinctness checks and desktop/tablet/mobile visual QA remain pending because the complete image replacement is not yet implemented. Eighteen of the 38 audited photo-asset concepts still need generated replacements, and the page/section duplicate mappings require additional call-site-specific images beyond the base asset set. The tool's per-turn image-generation ceiling was reached at 10; continue in a later turn to generate the remaining unique assets before claiming completion.

## Planned final report fields

- Generated-image list and individual visual concepts.
- Old-to-new mapping (table above, updated if implementation reveals additional call-site-specific assets).
- Updated files/components/routes and responsive loading behavior.
- Alt-text and optimization summary including formats, dimensions, and asset sizes.
- QA results: path checks, duplicate-use scan, route rendering, and desktop/tablet/mobile visual checks.
