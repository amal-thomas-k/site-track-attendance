# Stitch Export Reference

This folder contains the `stitch.withgoogle.com` design export for SiteTrack Attendance.

## What Is In This Folder

- `archive/stitch.zip`
  The original exported archive as received.
- `stitch/*/code.html`
  Stitch-generated HTML/Tailwind mockups for each screen.
- `stitch/*/screen.png`
  Visual mockups for the same screens.
- `stitch/ironclad_industrial/DESIGN.md`
  The exported design system brief.

## Design Direction Captured By Stitch

The export defines an industrial dark-theme design system centered on:

- Space Grotesk + Inter typography
- Deep green/charcoal surfaces
- Safety orange primary actions
- High-contrast outdoor legibility
- Dense operational dashboards for site admins

The design brief names this direction **"Industrial Precision"** / **"The Digital Foreman"**.

## Screen Coverage

Core current-product references:

- `mark_attendance_worker`
- `attendance_history_worker`
- `attendance_marked_success`
- `admin_dashboard`
- `workers_management`

Future-scope references:

- `admin_notifications`
- `admin_settings`
- `detailed_analytics_admin`
- `site_reports_admin`

## Analysis

This export is useful, but it is **not production-ready application code** for this repository.

Why:

- The generated files are static HTML/Tailwind screens, while this app is an Expo + React Native project.
- The mockups include web-only layout patterns and placeholder data.
- Several screens go beyond the currently implemented scope and should be treated as future backlog references.

## Recommended Use

- Use the PNGs for product/design review and stakeholder alignment.
- Use the HTML files as layout and styling reference when redesigning React Native screens.
- Treat `DESIGN.md` as the source design brief if the team wants to move the app toward the Stitch visual language.
- Do not copy the HTML directly into the mobile app without translating it into React Native components.

## Mapping To Current Codebase

The current working app already covers these concepts in React Native:

- Worker check-in flow
- Worker history
- Admin dashboard
- Worker roster
- Firebase-backed attendance and notifications

The Stitch package adds stronger visual direction and extra future modules, but it does not replace the implemented app code under `src/`.
