# Beta Testing Checklist

## Prerequisites
- [ ] Chrome extension installed from unpacked/sideloaded build
- [ ] Active VLU account (online.vlu.edu.vn)
- [ ] Google account for Calendar sync testing

## Test Scenarios

### 1. Extension Installation and Setup
- [ ] Extension icon appears in Chrome toolbar
- [ ] Popup opens when clicking the icon
- [ ] VLU session detection works when logged into online.vlu.edu.vn
- [ ] VLU session detection correctly reports "not logged in" when not on VLU
- [ ] Term/year selectors populate correctly

### 2. Study Calendar Fetch
- [ ] Study calendar loads with correct event count
- [ ] Event subjects match VLU data
- [ ] Start/end times are correct (check timezone)
- [ ] Locations are correct
- [ ] Multi-week courses produce events for each week
- [ ] Courses with non-consecutive weeks work (e.g., weeks 2,4,6)

### 3. Exam Calendar Fetch
- [ ] Exam calendar loads with correct event count
- [ ] Exam dates and times are correct
- [ ] Exam locations are correct

### 4. Expired Sessions
- [ ] After VLU session expires, extension shows clear "session expired" error
- [ ] Extension does not crash on expired session
- [ ] Error message does not contain raw cookies or credentials

### 5. VLU Unavailability
- [ ] When online.vlu.edu.vn is down, extension shows clear "service unavailable" error
- [ ] Extension does not crash or hang indefinitely
- [ ] Error message is user-friendly

### 6. Parser Edge Cases
- [ ] Calendar with no events returns empty state (not a crash)
- [ ] Unusual time slots (e.g., evening classes, weekend classes) work correctly
- [ ] Subjects with special characters (Vietnamese, foreign languages) display correctly
- [ ] Location changes across weeks are handled
- [ ] Different term structures (HK01, HK02, HK03) work

### 7. CSV Export
- [ ] CSV file downloads correctly
- [ ] CSV contains all expected columns (Subject, StartDate, StartTime, EndDate, EndTime, Location, Description)
- [ ] CSV can be imported into Google Calendar (or other calendar apps)
- [ ] Special characters in subject/location are properly escaped in CSV

### 8. Google Calendar Sync
- [ ] Google Calendar sync creates events correctly
- [ ] Duplicate sync does not create duplicate events (idempotent)
- [ ] Updated events (location/time changes) sync correctly
- [ ] Event times are in the correct timezone
- [ ] Sync report shows correct created/updated/skipped/failed counts

### 9. Multiple Users
- [ ] Test with 3+ different VLU accounts
- [ ] Test with different majors (different course structures)
- [ ] Test with different year studies

### 10. Security
- [ ] VLU passwords are never requested by the extension
- [ ] No raw cookies appear in extension UI or error messages
- [ ] No cookies or tokens appear in console logs
- [ ] Extension works over HTTPS only

## Bug Reporting Template
```
## Environment
- Chrome Version:
- Extension Version:
- VLU Account (major/year):
- Calendar Type: [study/exam]
- Term: [HK01/HK02/HK03]
- Year: [YYYY-YYYY]

## Steps to Reproduce
1.

## Expected Behavior

## Actual Behavior

## Screenshots/Logs (redacted)
```
