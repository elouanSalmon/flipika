# Story 6.8: Structural Slides (Formatting & Text)

Status: review

## Story

As a User,
I want to insert slides that serve as section headers or text containers,
So that I can organize my report logically and add qualitative commentary.

## Acceptance Criteria

1. [x] **Section Title Slide**:
    - [x] Input fields for "Title" and "Subtitle".
    - [x] Rendered centered with large typography.
    - [x] Optional background color/style from theme.
2. [x] **Rich Text Slide**:
    - [x] Text area input for free-form content.
    - [x] Supports basic formatting (markdown or simple HTML: Bold, Italic, Lists).
    - [x] Rendered with readable body text styling.
3. [x] **Editor Integration**:
    - [x] These slide types appear in the "Add Slide" menu.
    - [x] "Scope" selector is disabled or hidden for these slides (as they are static).

## Tasks / Subtasks

- [x] Data Model Updates
    - [x] Add `SECTION_TITLE` and `RICH_TEXT` to `SlideType` enum.
    - [x] Extend `SlideConfig` to support `content` field (title, subtitle, body).
- [x] Component Development
    - [x] Create `SectionTitleSlide.tsx` (Visual component).
    - [x] Create `RichTextSlide.tsx` (Visual component).
- [x] Editor Integration
    - [x] Update `SlideSettingsPanel` to show text inputs instead of data scope for these types.
    - [x] Update `AddSlideMenu` to include new types.

## File List
- src/types/reportTypes.ts
- src/components/reports/ScopeSelector.tsx
- src/components/reports/slides/SectionTitleSlide.tsx
- src/components/reports/slides/RichTextSlide.tsx
- src/components/reports/SlideLibrary.tsx
- src/components/reports/SlideItem.tsx
- src/components/reports/slides/TopPerformersSlide.tsx

## Dev Notes

- **Data Structure**:
  These slides do NOT need `accountId` or `campaignIds`.
  The `config` object will need a flexible `content` property:
  ```typescript
  interface SlideConfig {
    // ... existing fields
    title?: string;      // For Section Title
    subtitle?: string;   // For Section Title
    body?: string;       // For Rich Text
  }
  ```
- **Styling**: use Tailwind typography for Rich Text.
