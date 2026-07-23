---
name: منهاج
description: Personal discipline and daily task tracker
colors:
  primary: "#1A2332"
  primary-light: "#E6E9ED"
  accent: "#BF7D3A"
  accent-light: "#F2EAE0"
  bg-page: "#F5F6F7"
  bg-card: "#FFFFFF"
  neutral-surface: "#EBEDEF"
  success: "#4A7C59"
  danger: "#B8453A"
  warning: "#C9A03E"
  text-primary: "#1A2332"
  text-secondary: "#55606B"
  text-muted: "#909BA6"
  border: "#E2E5E8"
typography:
  display:
    fontFamily: "Amiri, serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Cairo, sans-serif"
    fontSize: "0.938rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Cairo, sans-serif"
    fontSize: "0.813rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Cairo, sans-serif"
    fontSize: "0.688rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  button-primary-hover:
    backgroundColor: "#2A3648"
  button-secondary:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  button-danger:
    backgroundColor: "#F8EAE8"
    textColor: "{colors.danger}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  card:
    backgroundColor: "{colors.bg-card}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  input:
    backgroundColor: "{colors.bg-card}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
    borderColor: "{colors.border}"
---

# Design System: منهاج

## 1. Overview

**Creative North Star: "The Discipline Notebook"**

منهاج is a personal accountability tool — a crossed-out checkbox in a paper journal, not a dashboard. The interface is quiet and structural: cool neutrals, controlled spacing, low visual energy. Content sits on pure white cards against a cool off-white page, with a deep navy anchor and a restrained warm-accent (burnt gold) that appears only as a signal, never decoration.

The system is flat by default. Cards use borders, not shadows, to separate surfaces. The only rounded corners are gentle (8px max). Typography relies on a single sans (Cairo) for all UI, with Amiri reserved for page titles as a subtle nod to Arabic editorial craft.

**Key Characteristics:**
- Tool-like, not app-like. Low visual weight.
- Flat surfaces with border separation, no shadows at rest.
- Controlled rhythm: consistent 8px base spacing increments.
- Accent is a signal, not decoration — reserved for today's date, edit triggers, and primary CTAs in forms.
- Serious and reliable. No playfulness, no decoration that doesn't serve the task.

## 2. Colors

The palette is restrained and cool-leaning, designed for long daily use without fatigue.

### Primary
- **Deep Navy** (`#1A2332`): Primary brand color. Used for navigation, primary buttons, active states, and headings. Conveys stability and seriousness.
- **Navy Tint** (`#E6E9ED`): Light variant for secondary buttons, hover backgrounds on list items, and surface accents.

### Accent
- **Burnt Gold** (`#BF7D3A`): The only warm color in the system. Used sparingly: today's date indicator, edit icons, form focus rings, and accent buttons inside modals. Never decorative.
- **Gold Wash** (`#F2EAE0`): Light variant for confirmation buttons in subtask flows.

### Neutral
- **Cool Page** (`#F5F6F7`): Page background. Slightly cooler than pure white to reduce glare.
- **Pure White** (`#FFFFFF`): Card/surface backgrounds. High contrast on the page.
- **Mid Surface** (`#EBEDEF`): Secondary surface for panels and group headers.
- **Border** (`#E2E5E8`): Card borders and dividers. Cool, low-saturation.

### Semantic
- **Dark Text** (`#1A2332`): Primary text. Near-black with navy tint for readability.
- **Body Text** (`#55606B`): Secondary text, metadata, labels.
- **Muted Text** (`#909BA6`): Placeholder text, timestamps.
- **Success** (`#4A7C59`): Completion states, "تم" button active.
- **Danger** (`#B8453A`): Failure states, penalty counts, delete actions.
- **Warning** (`#C9A03E`): Partial completion, caution states.

### Named Rules
**The Restraint Rule.** The accent (Burnt Gold) covers ≤5% of any given screen. It is not a decorative flourish — if the accent appears, it carries information.

## 3. Typography

**Display Font:** Amiri (serif)
**Body Font:** Cairo (sans-serif)

**Character:** A single-workhorse sans paired with a classical Arabic serif for hierarchy alone. Cairo handles all UI — labels, buttons, body, data — at a tight scale. Amiri appears only in page titles (`h1`) as a signal of editorial weight.

### Hierarchy
- **Display** (Amiri, 700, 1.5rem, 1.3): Page titles. "الالتزامات", "العقوبات", "المراجعة". One per page.
- **Title** (Cairo, 600, 0.938rem, 1.4): Task card text. The primary content label.
- **Body** (Cairo, 400, 0.813rem, 1.5): Form labels, descriptions, commitment text, modal body copy. 65–75ch max width for paragraphs.
- **Label** (Cairo, 600, 0.688rem, 1.4): Button text, metadata, form labels, date bar numbers. Uppercased only in section headers within settings.

### Named Rules
**The One Family Rule.** Cairo carries every UI surface — buttons, cards, inputs, navigation. Amiri is a deliberate escalation for page titles only, never for body or UI copy.

## 4. Elevation

The system is flat by default. Depth is conveyed through tonal layering (white cards on a tinted page), not through shadows. Cards at rest have no shadow — the border alone defines the surface boundary.

Interactive feedback is conveyed through state changes (background shift, border color change, opacity) rather than lift. There are no drop shadows in the system.

## 5. Components

### Buttons
- **Shape:** Gently squared (4px radius). Standard padding 10px 14px.
- **Primary:** Deep Navy background, white text. Hover: slightly lighter navy (#2A3648). Active: opacity shift.
- **Secondary:** Navy tint background, Deep Navy text. Used for cancel and secondary actions.
- **Danger:** Light red background, danger text. Used for destructive actions.
- **Accent:** Burnt Gold background, white text. Used for confirmation in modals and subtask flows.
- **Task Buttons:** Inline buttons within task cards — success (green tint), danger (red tint), warning (yellow tint). Active state fills background with full color.

### Cards / Containers
- **Corner Style:** Rounded (8px radius).
- **Background:** Pure white.
- **Shadow Strategy:** None. Flat with 1px cool border.
- **Internal Padding:** 12px.
- **Color Indicator:** A 6px dot (border-radius: 50%) in the group color, placed top-right of the card content. Not a side stripe.

### Inputs / Fields
- **Style:** 1.5px cool border, white background, 4px radius.
- **Focus:** Border shifts to Deep Navy with a subtle 2px navy-tinted ring.
- **Padding:** 10px 12px. Consistent across text, date, number, select.
- **Disabled:** Reduced opacity (0.5).

### Navigation (Bottom Nav)
- **Style:** Fixed bottom bar, white background, 1px top border.
- **Items:** Icon + label stacked vertically. Inactive: muted gray. Active: Deep Navy.
- **Touch target:** Minimum 48px width per item.

### Day Bar
- **Buttons:** Compact date pills (44px min-width), white background, 1px border, 8px radius. Day number prominent (0.938rem, 700 weight).
- **State:** Selected fills Deep Navy. Today indicated by accent border. Today + selected = Deep Navy fill overrides accent border.
- **Nav buttons:** 6px padding, circular (50% border-radius), border, icon-only.

### Empty States
- **Style:** Centered column, 48px vertical padding. Muted icon (40px, 35% opacity) above a short text message. The text should be helpful, not generic — e.g., "لم تسجل أي التزامات بعد. أضف التزامك الأول من الزر أدناه."

## 6. Do's and Don'ts

### Do:
- **Do** use Deep Navy as the primary interaction color. It is the anchor of the system — buttons, active states, navigation.
- **Do** keep it flat. Cards have borders, not shadows. Surfaces sit on the page, not above it.
- **Do** use Burnt Gold sparingly — only for signals (today, edit, confirm). If it appears on more than one element per view, reconsider.
- **Do** use Cairo for every UI element. Amiri is reserved for page titles only.
- **Do** use the 8px spacing scale consistently. Margins and paddings should follow 4, 8, 12, 16 increments.
- **Do** write empty state messages that teach or guide — never just "لا توجد مهام."

### Don't:
- **Don't** use side-stripe borders (border-left/border-right > 1px as color accents). Replace with dots, badges, or full borders.
- **Don't** use shadows on cards. The system is flat by design.
- **Don't** use gradient text, glassmorphism, or decorative blurs.
- **Don't** use playful or childish elements: no bright cartoon colors, no bouncy animations, no gamification.
- **Don't** use display fonts on UI labels or buttons. Amiri only on page titles.
- **Don't** use rounded corners larger than 8px outside of avatars or indicator dots.
- **Don't** decorate with the accent color. If Burnt Gold doesn't communicate state, it shouldn't be there.
