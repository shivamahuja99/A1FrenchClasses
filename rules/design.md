Design System Strategy: The Academic Atelier
1. Overview & Creative North Star
The Creative North Star for this design system is "The Digital Atelier." 
Education—specifically the study of the French language—is a blend of rigorous structure and artistic expression. This system moves away from the "generic corporate portal" look. Instead, it adopts a high-end editorial aesthetic that mirrors the experience of a premium boutique school in Paris. 
We break the "template" mold by leveraging Intentional Asymmetry and Tonal Depth. By utilizing white space as a functional element rather than a void, we create a layout that feels curated. This design system prioritizes a "Quiet Authority"—it is professional and clear, yet possesses a soul through sophisticated layering and a rejection of harsh, traditional UI boundaries.
***2. Colors & Surface Philosophy
The palette is rooted in the academic blue and the vibrant "L'Orange" accent, but it is executed through a Material 3 lens to provide depth and nuance.
The "No-Line" Rule
To achieve a premium feel, 1px solid borders for sectioning are strictly prohibited. Structural boundaries must be defined solely through background color shifts. For instance, a surface-container-low section should sit directly against a surface background. This creates a modern, seamless flow that feels architectural rather than "boxed in."
Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers. 
Use surface (#f8f9ff) for the primary page background.
Use surface-container-lowest (#ffffff) for primary content cards to create a subtle "lift."
Use surface-container-high (#dee9fc) for interactive sidebar elements or secondary utility areas.
The "Glass & Gradient" Rule
To avoid a flat, "out-of-the-box" appearance:
Floating Elements: Use Glassmorphism for navigation bars and modal overlays. Use semi-transparent surface colors with a backdrop-filter: blur(20px).
Signature Textures: For Hero sections and primary CTAs, utilize a subtle linear gradient from primary (#004ac6) to primary-container (#2563eb). This adds a "visual pulse" and depth that flat hex codes cannot provide.
***3. Typography: The Editorial Scale
We use Inter exclusively, but we treat it with editorial intent. The contrast between massive display sizes and utilitarian labels creates a sophisticated hierarchy.
Display (LG/MD/SM): Reserved for hero titles and major section headers. Use on-surface (#121c2a) with a -0.02em letter-spacing for a tight, high-end feel.
Headline & Title: Used to guide the user through course categories. These should feel authoritative and clear.
Body: Standardized at body-lg (16px) for high legibility. Ensure a line-height of at least 1.6 for long-form educational content.
Labels: Use label-md for metadata (e.g., "Level: B1") in uppercase with 0.05em letter-spacing to provide a modern, "tagged" look.
***4. Elevation & Depth
Depth is achieved through Tonal Layering, not structural lines.
The Layering Principle: Place a surface-container-lowest card on a surface-container-low section. This creates a natural, soft lift that mimics fine paper layering.
Ambient Shadows: Shadows are a last resort. When used, they must be ultra-diffused. 
Formula: 0px 12px 32px rgba(18, 28, 42, 0.06). The shadow uses a tint of on-surface to feel like natural light, never pure black.
The "Ghost Border" Fallback: If a container requires a border for accessibility (e.g., input fields), use the outline-variant (#c3c6d7) at 20% opacity. 100% opaque borders are forbidden.
Glassmorphism: Apply a subtle outline-variant (10% opacity) to the edge of glass containers to simulate the "catch-light" on the edge of a pane of glass.
***5. Components
Buttons
Primary: Gradient fill (primary to primary-container), on-primary text, xl (12px) roundedness. No shadow.
Secondary: surface-container-high background with primary text. This provides a tactile feel without the visual weight of a solid button.
Tertiary: Pure text with an underline that appears on hover, utilizing the primary color.
Input Fields
Avoid the "box" look. Use a surface-container-low background with a bottom-border only, or a very light ghost border. 
Focused states transition the background to surface-container-highest with a primary 2px bottom-bar indicator.
Cards & Lists
The No-Divider Rule: Never use horizontal lines to separate list items. Use vertical padding (from the spacing scale) and subtle surface shifts.
Cards: Use surface-container-lowest for the card body. On hover, the card should transition to surface-container-high with a slight 2px vertical lift.
Signature Component: The "Leçon" Card
For course listings, use an asymmetrical layout. Place the course level (A1, B2) as a display-sm element overlapping the edge of a surface-container-lowest card. This break in the grid signifies a modern, premium educational brand.
***6. Do's and Don'ts
Do:
Use generous white space to let the French language "breathe."
Use asymmetric layouts for images and text blocks to create a high-end magazine feel.
Use the secondary orange (secondary-container #fe9800) sparingly as a "call-to-attention" (e.g., "Live Class Now" indicators).
Don't:
Don't use 1px solid dividers. Use tonal shifts or whitespace.
Don't use pure black text. Always use on-surface (#121c2a) for a softer, more professional contrast.
Don't use sharp corners. Adhere strictly to the xl (0.75rem) and lg (0.5rem) roundedness scale to maintain an approachable, modern "Atelier" vibe.
Don't clutter. If a screen feels busy, increase the background-color contrast between sections instead of adding lines.
