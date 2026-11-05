# Moon-and-star app icon

The user explicitly chose a non-mascot icon after reviewing the existing purple geometric icon and the app's navy/cream/gold UI.

- Final production asset: `icon-moon-star-v2.png`, opaque RGB PNG, 1024×1024.
- Applied to `icon.png`, the native iOS AppIcon asset, and 32px web icon.
- Built-in image generation was used. No app AI API or SDK was added.
- The generated square was mechanically resized to Apple's 1024px asset size with `sips`; the artwork was not redrawn in code.
- The discarded Mongi-face draft was not applied.
- New binary build and rendered QA are pending because automatic approval review reached its usage limit. TestFlight 1.2.0(14) still contains the old app icon; App Review still has build 13.

## Generation prompt

Use case: logo-brand. Asset type: production iOS app icon for a calm dream journal, raster PNG. Create a single full-bleed square app icon, ideally 1024x1024, OPAQUE. Abstract moon-and-star emblem ONLY: one large elegant warm-cream crescent moon embracing a single small muted golden four-point star in its opening. Midnight navy background (#0B1426) with a restrained desaturated blue gradient (#223553). Main crescent occupies about 58% of canvas and the star about 16%, together a centered balanced silhouette, comfortable 18% safe margins. Refined minimal geometric forms, soft matte paper-like finish and very subtle warm light, crisp clear edges, legible at 40px. Palette limited to navy, cream (#F7F1E5), moon gold (#E8CE96). Quiet, premium, welcoming; not childish. NO rabbit, NO mascot, NO face, NO characters, NO animals, NO extra stars, NO scenery, NO clouds, NO lettering, NO text, NO watermark, NO border, NO rounded app-icon mask baked in, NO mockup, NO transparency, NO purple. Output only the icon artwork.
