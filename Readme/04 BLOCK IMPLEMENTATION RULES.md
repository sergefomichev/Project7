# BLOCK_IMPLEMENTATION_RULES.md

## Core Rule

Every block is an individual art-direction task.

Do not treat blocks as generic sections.

Do not automatically reuse layouts from previous blocks.

Each block must be designed from its own references, content, motion idea, and visual role in the page.

---

## Reference Priority

Block references always override global design rules.

When provided references conflict with `DESIGN_DIRECTION.md`, follow the block references.

When provided references conflict with `FORBIDDEN_PATTERNS.md`, follow the references only if the result still does not feel generic, outdated, or template-like.

Do not copy references directly.

Extract principles and reinterpret them.

---

## Before Building A Block

Before writing code, analyze the provided references and identify:

1. Composition pattern
2. Typography pattern
3. Spacing rhythm
4. Motion pattern
5. Layering/depth pattern
6. Image/video treatment
7. Interaction idea
8. Emotional tone

Then propose the implementation approach.

Do not start coding immediately unless explicitly asked.

---

## Required Block Questions

Before implementation, answer internally:

- What makes this block visually interesting?
- What is the main focal point?
- What creates visual tension?
- What creates depth?
- What creates rhythm?
- What is the motion concept?
- What should the user remember after seeing this block?

If the block has no memorable visual idea, redesign it.

---

# High-Value Creative Patterns

Use these patterns when they fit the reference and content.

Do not force all of them into every block.

---

## 1. Sticky Product / Sticky Object

Use `position: sticky` when an important object should remain visible while the surrounding story changes.

Good for:

- product cards
- vinyl records
- 3D objects
- characters
- videos
- section titles
- quotes
- key metrics
- navigation labels

Example behavior:

- object stays fixed inside its section
- surrounding text changes while scrolling
- background layers move behind it
- object subtly scales, rotates, or changes opacity

Avoid:

- sticky elements with no narrative purpose
- sticky behavior that blocks content
- sticky elements on small mobile screens when it hurts readability

---

## 2. Full-Bleed Media

Use `object-fit: cover` for fullscreen or large media blocks.

Good for:

- hero videos
- campaign photography
- sports imagery
- cinematic backgrounds
- editorial galleries
- atmospheric section transitions

Rules:

- media should fill the frame
- crop intentionally
- preserve focal point
- avoid stretching
- add overlays only when needed for readability

Preferred CSS:

```css
.media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}