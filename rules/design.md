# Design System Strategy: French Premium Academy

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Elite French Academy."** 

We move away from the asymmetrical "Digital Atelier" look towards a more structured, premium, and authoritative aesthetic. The design reflects the prestige of scoring high on Canadian official language exams (TEF/TCF) while maintaining a warm, welcoming "French" feel.

## 2. Colors & Surface Philosophy
The palette is rooted in a deep academic Navy and a vibrant French Red accent.

### Color Tokens
- **Navy (#0A2540)**: Used for primary headings, navigation, and deep backgrounds. Represents authority and structure.
- **French Red (#E11D48)**: Used for primary actions, badges, and high-impact accents.
- **A1 Blue (#2563EB)**: Used for secondary callouts and trust indicators.
- **Gold (#F59E0B)**: Used for premium tiers, ratings, and critical highlights.
- **Cream (#FFF8F1)**: Used for student testimonials and social proof sections to provide warmth.

### Structural Logic
- **Borders**: Unlike the previous "No-Line" rule, we use structural 1px borders (#E5E7EB) for card definition to maintain a clean, organized hierarchy.
- **Gradients**: Use high-contrast gradients for major visual elements (e.g., HeroTransformation card) and deep navy radial gradients for section backgrounds.

## 3. Typography: The Academic Duo
We use a sophisticated font pair to balance prestige with modern legibility.

- **Headings (Playfair Display)**: Used for H1, H2, and major titles. ExtraBold (800) for a commanding presence.
- **Body (Inter)**: Used for all prose, UI labels, and lists. Highly legible and modern.

### Specific Scales
- **Hero Title**: 3.8rem (Playfair Display)
- **Section Headers**: 2.6rem (Playfair Display)
- **Eyebrows**: 0.78rem (Inter Bold, All-Caps, Wider Letter Spacing)

## 4. Components & Symbols

### Navigation (Glassmorphism)
The navigation bar utilizes a white background with 85% opacity and a 20px blur to maintain context while scrolling.

### The Transformation Visual (Hero)
A signature component showing the student's journey. Uses:
- Progress bars (`A1` -> `CLB 5` -> `CLB 7`).
- Floating badges ("98% Pass Rate").
- High-contrast value cards ("+50 CRS Points").

### Course Cards (The Ribbon Rule)
Courses are presented as distinct "Paths" rather than generic listings. 
- Use **Ribbons** to denote specific outcomes (e.g., "Work Permit Path," "PR Mastery").
- Use checklists with green checkmarks for feature lists.
- Featured cards get the `French Red` border and a subtle scale lift.

### Trust Indicators
- Clean, vertical stacks showing: Count (Playfair) + Label (Muted Inter).

## 5. Do's and Don'ts

### Do:
- Use **French Red** for the most important "Enroll" actions.
- Use **Playfair Display** to create a sense of history and prestige.
- Use **Radial Gradients** in section backgrounds to create a "Visual Pulse."

### Don't:
- Don't use generic rounded blocks; adhere to the `radius-lg` (14px) and `pill` scale.
- Don't use flat colors for large backgrounds; add subtle gradients or cream tints.
- Don't use thin weights for headings; the Academy aesthetic requires bold, authoritative strokes.
