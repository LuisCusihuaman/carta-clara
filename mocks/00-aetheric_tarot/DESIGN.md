---
name: Aetheric Tarot
colors:
  surface: '#16130b'
  surface-dim: '#16130b'
  surface-bright: '#3d392f'
  surface-container-lowest: '#110e07'
  surface-container-low: '#1f1b13'
  surface-container: '#231f17'
  surface-container-high: '#2d2a21'
  surface-container-highest: '#38342b'
  on-surface: '#eae1d4'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#eae1d4'
  inverse-on-surface: '#343027'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#dcb8ff'
  on-secondary: '#480081'
  secondary-container: '#7701d0'
  on-secondary-container: '#dcb7ff'
  tertiary: '#bfcdff'
  on-tertiary: '#082b72'
  tertiary-container: '#97b0ff'
  on-tertiary-container: '#254188'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#efdbff'
  secondary-fixed-dim: '#dcb8ff'
  on-secondary-fixed: '#2c0051'
  on-secondary-fixed-variant: '#6700b5'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#27438a'
  background: '#16130b'
  on-background: '#eae1d4'
  surface-variant: '#38342b'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-margin: 20px
  gutter: 12px
---

## Brand & Style

This design system is anchored in the "Deep Cosmic" aesthetic, targeting an audience seeking spiritual introspection through a premium, tech-forward interface. The brand personality is mysterious, authoritative, and ethereal. 

The visual style blends **Glassmorphism** with **high-end editorial typography**. It utilizes deep, near-black violet voids contrasted against "Mystic Gold" linework and iridescent "Electric Violet" glows. The user experience should feel like looking through a telescope into a digital nebula—layered, translucent, and physically resonant.

## Colors

The palette is dominated by **Obsidian Void** (#05040A), providing a high-contrast foundation for celestial elements. 
- **Mystic Gold (#D4AF37):** Used for iconography, thin borders, and primary highlights to signify value and sacredness.
- **Electric Violet (#8A2BE2):** Powers the iridescent gradients and active states, representing intuition and the cosmic energy.
- **Surface Colors:** Glass layers use semi-transparent versions of the background with a slight purple tint to maintain depth without breaking the dark-mode immersion.

## Typography

This design system uses a dual-font strategy to balance tradition and modern utility.
- **Playfair Display:** Employed for card titles and screen headers. It evokes the feeling of antique tarot decks and classical literature.
- **Be Vietnam Pro:** A clean, geometric sans-serif used for interpretation text and UI labels to ensure maximum readability against dark, glowing backgrounds.

For mobile screens, `display-lg` is reserved for hero card reveals, while `headline-md` serves as the primary navigation title.

## Layout & Spacing

The layout follows a **fluid grid** centered on a mobile-first 4-column system. 
- **Rhythm:** An 8px soft-grid governs vertical spacing to ensure a balanced, editorial feel.
- **Margins:** 20px side margins provide breathing room for the glassmorphic cards.
- **Hierarchy:** Large vertical gaps (40px+) are used to separate the "Major Arcana" focal point (the card) from the "Interpretation" list below.

## Elevation & Depth

Depth is conveyed through **Glassmorphism** rather than traditional shadows.
- **Layer 0 (Background):** Solid #05040A.
- **Layer 1 (Containers):** 40% opacity surfaces with a 20px background blur and a 1px "Mystic Gold" inner stroke (opacity 15%) to define edges.
- **Layer 2 (Floating Elements):** Subtle outer glows using the "Electric Violet" color (blur: 15px, spread: -5px) to suggest the element is radiating cosmic energy.
- **Interactivity:** On press, glass elements should increase in opacity and glow intensity.

## Shapes

The shape language is **Rounded** (0.5rem base) to soften the "mystic" edge and make the technology feel approachable.
- **Tarot Cards:** Use `rounded-lg` (1rem) to mimic the feel of premium physical cardstock.
- **Action Buttons:** Use `rounded-xl` (1.5rem) or full pill-shapes for high-priority CTA buttons to differentiate them from informational containers.
- **Input Fields:** Standard `rounded` (0.5rem) ensures a structured, organized appearance.

## Components

### Buttons
- **Primary:** Iridescent gradient (Violet to Gold) with white text. Subtle outer glow in violet.
- **Secondary/Ghost:** 1px Mystic Gold border, transparent center, gold text.

### Cards & Containers
- All interpretation sections (Love, Career, etc.) reside in glassmorphic list items.
- Top and bottom borders should be ultra-thin (0.5px) Mystic Gold at 10% opacity to create a "etched glass" effect.

### Chips & Toggles
- **Switch Toggles:** Use a violet-to-gold gradient for the 'active' track. 
- **Segmented Control:** A dark container with a glassmorphic sliding highlight to indicate the active state (e.g., "Upright" vs "Reversed").

### Icons
- Use thin-line (Light weight) icons in Mystic Gold. Avoid filled icons to maintain the airy, celestial aesthetic.

### Progress Indicators
- Circular loaders should use a spinning iridescent gradient, mimicking a star-chart or planetary orbit.