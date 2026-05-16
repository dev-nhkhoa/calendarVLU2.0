# Chrome Web Store Release Checklist

## Current Automated Validation Snapshot

- Final ZIP path: `calendarVLU2.0-extension/dist-zip/extension-20260516-034737.zip`
- Final ZIP SHA-256: `c1f852209cdff5aebf7ee88b3ba944706a2b82c59552afef287d595c5ec94ae1`
- Manifest permissions: `cookies`, `storage`, `tabs`, `alarms`
- Manifest host permissions: `https://online.vlu.edu.vn/*`, `https://*.vlu.edu.vn/*`, `https://calendar-vlu.nhkhoa.site/*`
- Automated checks completed: extension `pnpm type-check`, extension `pnpm lint`, extension `pnpm build`, extension `pnpm -F zipper zip`, backend `npm run lint`, backend `npm run build`, production dist scan for dev hosts and remote-code patterns.
- Remaining manual checks: Chrome unpacked smoke test, VLU account flow, Google OAuth flow, screenshots, and Chrome Web Store dashboard privacy form.

## Artifact

- [ ] Run `pnpm type-check` in `calendarVLU2.0-extension`
- [ ] Run `pnpm lint` in `calendarVLU2.0-extension`
- [ ] Run `pnpm build` in `calendarVLU2.0-extension`
- [ ] Run `pnpm -F zipper zip` in `calendarVLU2.0-extension`
- [x] Record final ZIP path: `calendarVLU2.0-extension/dist-zip/extension-20260516-034737.zip`
- [x] Record final ZIP SHA-256: `c1f852209cdff5aebf7ee88b3ba944706a2b82c59552afef287d595c5ec94ae1`

## Manifest Review

- [ ] `manifest_version` is 3
- [ ] `background.service_worker` is present
- [ ] No `localhost`, `ws://`, `refresh.js`, or dev content scripts in production `dist/manifest.json`
- [ ] No `http://online.vlu.edu.vn/*` or `http://*.vlu.edu.vn/*` production host permissions
- [ ] Permissions are limited to `cookies`, `storage`, `tabs`, and `alarms`
- [ ] Permission justifications in `docs/chrome-web-store/listing.md` match the final manifest

## Static Security Scan

- [ ] Dist contains no `eval(`
- [ ] Dist contains no `new Function`
- [ ] Dist contains no `importScripts`
- [ ] Popup HTML only loads packaged extension assets
- [ ] CSP uses `script-src 'self'` and does not allow remote scripts

## Store Listing

- [ ] Name: `CalendarVLU - Đồng bộ lịch VLU với Google Calendar`
- [ ] Short description mentions Google Calendar and CSV/iCal only
- [ ] Full description does not mention Outlook until Outlook is shipped in the extension UI
- [ ] Screenshots show only shipped features: VLU detection, calendar fetch, Google sync, CSV/iCal export
- [ ] Support email is set to `work.nhkhoa@gmail.com`

## Privacy

- [ ] Privacy policy URL: `https://calendar-vlu.nhkhoa.site/privacy-policy`
- [ ] Terms URL: `https://calendar-vlu.nhkhoa.site/terms`
- [ ] Privacy policy discloses VLU session cookie handling
- [ ] Privacy policy discloses VLU calendar event processing
- [ ] Privacy policy discloses Google OAuth token storage and Google Calendar data use
- [ ] Privacy policy includes the Google API Limited Use statement
- [ ] Chrome Web Store privacy tab matches the privacy policy

## Backend Environment

- [ ] `NEXT_PUBLIC_APP_URL=https://calendar-vlu.nhkhoa.site`
- [ ] `EXTENSION_ALLOWED_ORIGINS=chrome-extension://<prod-extension-id>,https://calendar-vlu.nhkhoa.site`
- [ ] Google OAuth authorized JavaScript origin: `https://calendar-vlu.nhkhoa.site`
- [ ] Google OAuth authorized redirect URI matches the deployed auth callback route
- [ ] Backend deployment contains the same privacy policy content as this repo

## Manual Smoke Tests

- [ ] Load unpacked extension from `calendarVLU2.0-extension/dist`
- [ ] Popup renders without console errors
- [ ] Popup detects an active VLU tab
- [ ] Fetch study calendar succeeds
- [ ] Fetch exam calendar succeeds
- [ ] Export CSV succeeds and file opens correctly
- [ ] Export iCal succeeds and imports into a calendar app
- [ ] Google OAuth connect succeeds
- [ ] Google calendar list loads
- [ ] Sync selected events to Google Calendar succeeds
- [ ] Disconnect Google succeeds
- [ ] Offline or degraded backend state shows a clear user message

## Review Notes

- Single purpose: fetch a user's own VLU study/exam schedule, export CSV/iCal, and sync selected events to Google Calendar.
- `cookies` permission is needed only to read the user's existing VLU session cookies after they log in directly on `online.vlu.edu.vn`.
- `tabs` permission is needed to detect the active VLU tab, open the Google OAuth tab, and observe the OAuth return navigation.
- `alarms` permission is needed to keep long Google sync jobs resilient while the MV3 service worker processes batches.
- Google user data is only used for user-facing calendar sync and follows Limited Use requirements.
