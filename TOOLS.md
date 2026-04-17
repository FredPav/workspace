# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

## Browser Configuration (Standardized)

**Browser Path:** `/usr/bin/chromium` (installed via `apt-get install chromium`)

**Used by:**
- Dinantia Reader (refresh-session-puppeteer.js)
- La Carte des Colocs (refresh_session.js)

**Installation:**
```bash
apt-get update && apt-get install -y chromium
```

**Note:** All Puppeteer-based skills now use the same system Chromium installation for consistency.

**Path constant:** `BROWSER_PATH = '/usr/bin/chromium'`

**Usage in scripts:**
```javascript
// Standard browser path used by all OpenClaw skills
const BROWSER_PATH = '/usr/bin/chromium';

const browser = await puppeteer.launch({
  executablePath: BROWSER_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

## Dinantia Scripts Location
**Path:** `/data/workspace/skills/dinantia-reader/scripts/`
**Files:**
- `check-new.js` - Fetches new Dinantia messages
- `get-wall-posts.js` - Fetches Dinantia wall posts
- `refresh-session-puppeteer.js` - Refreshes Dinantia session via Puppeteer
- `dinantia-daily-brief.js` - Daily brief generation and calendar sync
- `sync_events_to_calendar.js` - Syncs Dinantia events to Google Calendar
- `session.json` - Stores Dinantia session data (created by refresh-session-puppeteer.js)

---

Add whatever helps you do your job. This is your cheat sheet.
