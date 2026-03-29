# SmartPrep AI PRD Implementation Roadmap

## Current Position

The repository currently implements a working base product, but it does not yet satisfy the full Product Requirements Document.

The largest missing areas are:

- full email delivery and verification lifecycle
- question sets
- advanced question bank fields and filters
- five-step test builder
- autosave and resumable attempts
- proctoring
- PDF exports
- bookmarks
- notifications
- per-question discussions
- AI doubt solver
- student detail pages
- leaderboards
- gamification
- platform-wide analytics depth

## What Was Added In This Upgrade Slice

This implementation pass establishes the auth foundation required by the PRD:

- stronger password policy on registration and reset
- email verification state stored on users
- verification token creation and resend support
- password reset token creation and reset endpoint
- login blocked until verification
- temporary account lock after repeated failed logins
- frontend registration flow updated to verification-first
- forgot-password UI connected to a real API
- reset-password page added

## Recommended Delivery Phases

### Phase 1: Auth And User Security

- real email provider integration
- verification success and resend UX polishing
- session inactivity refresh behavior
- server-side rate limiting
- security headers
- user verification status on admin pages

### Phase 2: Data Model Expansion

- richer question schema
- question reports
- question sets
- test sections based on sets
- attempt notes
- bookmarks
- notifications collections
- proctoring log schema

### Phase 3: Admin Content Systems

- advanced question bank layout and filters
- bulk actions
- import preview and validation
- set management UI
- AI generation preview and save destinations
- five-step test builder

### Phase 4: Student Test Experience

- resumable attempts
- autosave every 30 seconds
- server-backed timer model
- instruction and permission flow
- richer question states
- per-question notes and bookmarks

### Phase 5: Proctoring

- camera and microphone permissions
- client-side face detection
- snapshot capture and storage
- event timeline
- AI integrity summary
- admin review UI

### Phase 6: Results, Analytics, And Engagement

- result release rules
- PDF export
- richer student analytics
- admin student detail page
- global analytics dashboards
- leaderboards
- notifications
- discussions
- AI doubt solver
- streaks and badges

## Important Implementation Note

The current repository can be upgraded to meet the PRD, but this is a multi-phase product build, not a single small patch. The auth foundation is now aligned much more closely with the PRD, and the next highest-leverage step is expanding the data model for question sets, question reports, bookmarks, notes, and proctoring logs.
