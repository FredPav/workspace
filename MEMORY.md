# MEMORY.md - Long-Term Memory

## Current Date Context
**Today:** Friday, April 17, 2026
**Timezone:** UTC / Europe/Madrid

## 🔧 Chromium Browser Installation (April 17, 2026)
**Issue:** Chromium browser was not installed, causing Dinantia and Arabic Learning cron jobs to fail
**Resolution:** Installed Chromium using `apt-get install chromium`
**Status:** ✅ Fixed - Both cron jobs now working
**Location:** `/usr/bin/chromium`

### Standardized Browser Path
**Path:** `/usr/bin/chromium`
**Used by:**
- Dinantia Reader (refresh-session-puppeteer.js)
- La Carte des Colocs (refresh_session.js)

**All Puppeteer-based skills now use the same system Chromium installation for consistency:**
- `BROWSER_PATH = '/usr/bin/chromium'` defined in all Puppeteer scripts
- Updated: `TOOLS.md` section "Browser Configuration (Standardized)"
- **Usage:** `const browser = await puppeteer.launch({ executablePath: BROWSER_PATH, ... })`

## 🔧 Git Repository Recovery (April 17, 2026)
**Issue:** Git repository became corrupted with missing blobs/trees
**Resolution:** 
- Re-initialized Git repository
- Recreated Dinantia scripts from session logs
- Committed changes locally
- **Unable to push:** SSH keys not configured in environment

**Status:** Changes committed locally, pushing requires manual SSH key setup
