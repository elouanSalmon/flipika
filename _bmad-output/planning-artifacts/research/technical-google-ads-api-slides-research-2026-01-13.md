---
stepsCompleted: [1]
inputDocuments: []
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'google-ads-api-slides'
research_goals: 'Identify slide types for accounts, campaigns, creatives based on Google Ads API structure'
user_name: 'Elou'
date: '2026-01-13'
web_research_enabled: true
source_verification: true
---

# Research Report: technical

**Date:** 2026-01-13
**Author:** Elou
**Research Type:** technical

---


---

## Technical Research Scope Confirmation

**Research Topic:** google-ads-api-slides
**Research Goals:** Identify slide types for accounts, campaigns, creatives based on Google Ads API structure

**Technical Research Scope:**

- Architecture Analysis - design patterns, frameworks, system architecture
- Implementation Approaches - development methodologies, coding patterns
- Technology Stack - languages, frameworks, tools, platforms
- Integration Patterns - APIs, protocols, interoperability
- Performance Considerations - scalability, optimization, patterns

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-01-13

## Google Ads API Architecture & Slide Implementation Guide

Based on the analysis of the Google Ads API structure, here is a breakdown of the key entities and how they should be mapped to presentation slides.

### 1. API Hierarchy Overview

The Google Ads API follows a strict hierarchy which should be mirrored in the presentation structure:

1.  **Customer (Client)**: The root entity. Represents the account.
2.  **Campaign**: The primary unit of management (Budget, targeting, dates).
3.  **AdGroup**: Containers for ads and targeting criteria within a campaign.
4.  **AdGroupAd (Ad/Creative)**: The actual ad content (text, image, video).
5.  **Assets**: Shared elements (Headlines, Descriptions, Images) linked to Ads or Extensions.

### 2. Proposed Slide Types & Data Mapping

#### A. Account Overview Slide (Client Level)
*   **Goal**: High-level summary of the account's identity and performance.
*   **API Resource**: `Customer`
*   **Key Data Points**:
    *   `descriptive_name` (Account Name)
    *   `currency_code`
    *   `time_zone`
    *   Linked Data: **Account Performance** (metrics like `metrics.clicks`, `metrics.impressions`, `metrics.cost_micros` at customer level).
*   **Visual Elements**: Account Logo (if available via Assets), KPI Cards.

#### B. Campaign Performance Slide
*   **Goal**: Show how specific campaigns are performing.
*   **API Resource**: `Campaign`
*   **Key Data Points**:
    *   `name`
    *   `status` (ENABLED, PAUSED)
    *   `advertising_channel_type` (SEARCH, DISPLAY, PERFORMANCE_MAX, etc.) - **Crucial for distinct slide layouts.**
    *   `campaign_budget`
    *   `start_date`, `end_date`
*   **Visual Elements**: Time-series chart (Clicks/Cost over time), Status Badge.

#### C. Ad Group & Targeting Slide
*   **Goal**: Drill down into *who* is seeing the ads.
*   **API Resource**: `AdGroup` + `AdGroupCriterion` (Keywords/Audiences)
*   **Key Data Points**:
    *   `name`
    *   `type` (SEARCH_STANDARD, DISPLAY_STANDARD)
    *   **Keywords**: Retrieve `AdGroupCriterion` where `type = KEYWORD`. List top performing keywords (`keyword.text`, `metrics.ctr`).
    *   **Audiences**: Retrieve `AdGroupCriterion` where `type = USER_LIST` or similar.
*   **Visual Elements**: List of top keywords, Word Cloud, Audience Demographics charts.

#### D. Creative / Ad Slide (The "Visual" Slide)
*   **Goal**: Show what the ads actually look like.
*   **API Resource**: `AdGroupAd` -> `Ad`
*   **Complex Mapping**: Modern ads are "Responsive". You don't have a single "image". You have **Assets**.
*   **Implementation Strategy**:
    *   **Responsive Search Ads**: Fetch `AdGroupAd`. The `ad.responsive_search_ad` field contains lists of `headlines` and `descriptions` (which are `Asset` objects).
        *   *Slide Layout*: Mockup of a Google Search result. Randomly mix and match 3 headlines + 2 descriptions to show a "preview".
    *   **Responsive Display Ads**: Fetch `AdGroupAd`. The `ad.responsive_display_ad` contains `marketing_images`, `square_marketing_images`, `headlines`, `long_headline`.
        *   *Slide Layout*: Grid of image assets + Text overlay.
    *   **Performance Max**: Complex. Uses `AssetGroup` linked to `Campaign`.
        *   *Slide Layout*: Show a "Asset Collection" - a gallery of top performing images and text assets.
*   **Asset Service**: You usually need to query `AssetService` to get the actual URL of simple image assets if they are referenced by ID.

#### E. Asset Performance Slide
*   **Goal**: Show which headlines/images work best.
*   **API Resource**: `AdGroupAdAssetView`
*   **Key Data Points**:
    *   `performance_label` (BEST, GOOD, LOW)
    *   `asset` (Link to the actual text/image)
*   **Visual Elements**: A "Leaderboard" of best headlines and images.

### 3. Implementation Checklist for Slide Generator

1.  **[Service]** Implement `GoogleAdsClient` wrapper.
2.  **[Fetcher]** Create a `CampaignFetcher` that gets Campaigns + Metrics.
3.  **[Fetcher]** Create an `AdGroupFetcher` that gets AdGroups + Keywords.
4.  **[Fetcher]** Create an `AdFetcher` that gets `AdGroupAds` and **resolves Assets**.
    *   *Critical*: Start with simple `TextAsset` decoding. Then handle `ImageAsset` (requires downloading/caching images).
5.  **[Renderer]** Build a `SearchAdPreview` React component (Title in blue, URL in green, Description in gray).
6.  **[Renderer]** Build an `ImageGallery` component for Display/PMax assets.

### 4. Special Considerations for "Types of Slides"

*   **PMax (Performance Max)** is the new standard. It doesn't have "Ad Groups" in the traditional sense; it uses "Asset Groups". You MUST support `AssetGroup` to show PMax creatives.
*   **Video Ads**: YouTube ads (`ad.video_ad`) reference `YouTubeVideoAsset`. You'll need the YouTube video ID to embed a thumbnail or link.

---


---

## Technical Research Scope Confirmation

**Research Topic:** google-ads-api-slides
**Research Goals:** Identify slide types for accounts, campaigns, creatives based on Google Ads API structure

**Technical Research Scope:**

- Architecture Analysis - design patterns, frameworks, system architecture
- Implementation Approaches - development methodologies, coding patterns
- Technology Stack - languages, frameworks, tools, platforms
- Integration Patterns - APIs, protocols, interoperability
- Performance Considerations - scalability, optimization, patterns

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-01-13
