# Launch Readiness Checklist

## Security (S8-TC01, S8-TC02)
- [ ] Rate limiting configured for all extension API endpoints (60 req/min per client)
- [ ] Request size limits enforced (64 KB max for POST bodies)
- [ ] CORS allowlist configured (EXTENSION_ALLOWED_ORIGINS)
- [ ] Only exact allowlisted extension/app origins are allowed for extension APIs; no wildcard chrome-extension:// trust
- [ ] HTTPS enforced (no HTTP access in production)
- [ ] Security headers set (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- [ ] Cookies and tokens never appear in logs (audit logger redacts sensitive data)
- [ ] VLU passwords are never collected by the extension flow
- [ ] Environment variables reviewed for secrets exposure

## Backend Infrastructure
- [ ] Database migrations run and verified
- [ ] Environment variables set in production (NEXT_PUBLIC_APP_URL, AUTH_SECRET, etc.)
- [ ] Extension API keys/generated tokens configured
- [ ] Health endpoint returns correct status (/api/extension/health)
- [ ] Sitemap and robots.txt accessible
- [ ] Privacy Policy and Terms routes accessible
- [ ] Rate limit backed by Upstash Redis (shared across instances, persistent across cold starts)

## Monitoring (S8-TC07)
- [ ] Failure counters track VLU fetch failures, parser failures, Google sync failures
- [ ] Health endpoint exposes diagnostic counters
- [ ] Audit logging enabled in production (AUDIT_LOG=1)
- [ ] Console output reviewed for sensitive data exposure

## Chrome Web Store (S8-TC05)
- [ ] Store listing text finalized (title, description, screenshots)
- [ ] Permission justifications documented
- [ ] Privacy policy URL set to https://calendar-vlu.nhkhoa.site/privacy-policy
- [ ] Terms URL set to https://calendar-vlu.nhkhoa.site/terms
- [ ] Chrome Web Store privacy practices match the published privacy policy and actual extension behavior
- [ ] Google API Limited Use statement is present in the published privacy policy
- [ ] Listing does not mention unshipped Outlook functionality
- [ ] Extension package built and tested
- [ ] Production manifest contains no localhost, ws://, dev content scripts, or unnecessary HTTP host permissions
- [ ] No secrets bundled in extension package
- [ ] Extension icon and screenshots prepared

## Deprecation / Migration (S8-TC06)
- [ ] Old VLU password form clearly marked as deprecated
- [ ] Old API endpoints (/api/accounts/vlu, /api/calendars) send deprecation headers
- [ ] Convert page shows deprecation banner with link to extension
- [ ] Settings page shows deprecation warning for VLU account linking

## Beta Testing (S8-TC04)
- [ ] Expired session flow tested
- [ ] VLU unavailability flow tested
- [ ] Parser edge cases tested (empty schedules, missing fields, special chars)
- [ ] CSV export tested and importable into Google Calendar
- [ ] Google Calendar sync tested (create, update, deduplicate)
- [ ] At least 3 different VLU accounts tested

## Pre-Launch
- [ ] Build passes (npm run build)
- [ ] All tests pass (npm test)
- [ ] Lint passes (npm run lint)
- [ ] Production build size reviewed
- [ ] README updated with current architecture info
- [ ] CHANGELOG or equivalent release notes prepared

## Known Limitations
- Parser depends on VLU HTML structure — if VLU changes their site, the parser may fail and require a hotfix.
- Rate limits are backed by Upstash Redis with in-memory fallback (circuit breaker pattern) — single-instance / dev fallback to memory if Redis is unavailable.
- Extension-only flow means users must be on a desktop browser with Chrome. Mobile/tablet users cannot use the extension.
