# Design System Strategy: Industrial Precision

## 1. Overview & Creative North Star: "The Digital Foreman"
This design system moves away from the flimsy, generic "app" feel and toward the authoritative, rugged reliability of high-end industrial tools. Our Creative North Star is **"The Digital Foreman"**—a system that feels as intentional and sturdy as a steel beam, yet as sophisticated as a modern architectural blueprint.

To break the "template" look common in utility apps, we lean into **Atmospheric Depth** and **Asymmetric Utility**. We avoid the standard "box-in-a-box" layout. Instead, we use high-contrast typography scales (Space Grotesk vs. Inter) and overlapping surface layers to create a sense of structural integrity. The interface doesn't just display data; it builds an environment of professional trust for high-stakes job sites.

---

## 2. Colors & Surface Architecture
We utilize a palette inspired by heavy machinery and site safety, optimized for high-glare outdoor conditions.

### The "No-Line" Rule
**Standard 1px borders are strictly prohibited.** To section content, designers must use background color shifts. For example, a `surface-container-low` (#002020) card should sit on a `surface` (#001717) background. This creates a cleaner, more premium look that reduces visual "noise" on low-end Android displays.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials. 
- **Base Level:** `surface` (#001717) for the main application background.
- **Sectioning:** Use `surface-container` (#002424) for large grouping areas.
- **Actionable Cards:** Use `surface-container-high` (#0c2f2f) to make data feel "raised" and ready for interaction.

### The "Glass & Gradient" Rule
To elevate the "industrial" feel into "industrial-modern," use subtle gradients on primary CTAs. Transition from `primary` (#ffb77d) to `primary_container` (#ff8c00) at a 135-degree angle. This mimics the reflective quality of safety gear and prevents the UI from feeling flat.

---

## 3. Typography: The Editorial Blueprint
Our typography pairs the technical, geometric precision of **Space Grotesk** with the hyper-legible utility of **Inter**.

*   **Display & Headlines (Space Grotesk):** Used for site names, attendance counts, and primary navigation headers. The wide apertures and geometric forms convey a sense of modern engineering. 
    *   *Example:* `display-md` (2.75rem) for daily attendance totals.
*   **Body & Titles (Inter):** Used for all functional data. Inter's tall x-height ensures readability even on lower-resolution screens under direct sunlight.
    *   *Example:* `body-lg` (1rem) for worker names in a list.
*   **Labels (Inter Bold):** Small caps or bolded labels are used for metadata (e.g., "SHIFT START," "ZONE B").

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to show "floating" elements. We use **Tonal Layering** to show "structural" depth.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` (#001111) element can be used as an "inset" well for search bars, while a `surface-container-highest` (#193a3a) element acts as a "raised" floating action button.
*   **Ambient Shadows:** If a modal requires a shadow, use a large blur (24px+) with a low-opacity tint of the `on-surface` color (e.g., `#c6e9e9` at 6%). This creates a natural glow rather than a muddy grey drop shadow.
*   **The "Ghost Border" Fallback:** If a boundary is required for accessibility, use the `outline-variant` (#564334) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** High-visibility safety orange (`primary_container` #ff8c00). Rectangular with a slight `DEFAULT` (0.25rem) corner radius. Use `on_primary_container` (#623200) for text to maintain a "safety-vest" contrast ratio.
*   **Secondary:** `secondary_container` (#6a3b0f) with `on_secondary_container` text. Used for less urgent site actions.

### Cards & Lists: The Separation Rule
**Forbid the use of divider lines.**
Separate workers in a list using vertical white space (`spacing-3` or 1rem) or by alternating background tiers between `surface-container` and `surface-container-low`. This prevents the "jail cell" look of many construction apps.

### Status Indicators
*   **Present:** Use `tertiary` (#85cfff) or a custom deep green.
*   **Absent/Error:** Use `error` (#ffb4ab) on `error_container` (#93000a).
*   *Note:* Status should always be accompanied by a unique icon (Check vs. X) to ensure accessibility for colorblind users on-site.

### Input Fields
Inputs should use `surface-container-lowest` (#001111) to create an "etched" look into the interface. Use a 2px `primary` underline only when the field is focused.

### Construction-Specific Components
*   **The "Gloves-On" Toggle:** Oversized toggle switches (minimum height 48dp) using `primary` for the "on" state, designed specifically for easy tapping with ruggedized cases or gloved hands.
*   **Site-Weather Header:** A semi-transparent glassmorphism header (`surface` at 80% opacity with 10px backdrop blur) that overlays the top of the list, showing current site conditions and time.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use the `1.4rem` (spacing-4) value as your standard gutter; industrial apps need "breathing room" to prevent accidental taps.
*   **Do** use `headline-lg` for critical numbers. In construction, the *data* is the hero.
*   **Do** leverage the `surface-bright` (#1e3e3e) tone for active states on cards to signify they have been selected.

### Don't:
*   **Don't** use pure black (#000000). It feels "hollow." Use our charcoal `surface` (#001717) for a richer, more premium depth.
*   **Don't** use `xl` (0.75rem) rounded corners. Construction is about hard edges and stability; stick to `sm` (0.125rem) or `md` (0.375rem).
*   **Don't** use thin font weights. Outdoor legibility requires `Medium` (500) or `Bold` (700) weights for almost all body text.