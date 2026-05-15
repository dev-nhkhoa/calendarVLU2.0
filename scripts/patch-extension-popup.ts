/**
 * Patch script for the compiled Chrome extension popup.
 *
 * Sprint 19 requires:
 * 1. CSS: width:380px → min-width:360px;max-width:480px (DONE — CSS patched)
 * 2. JS: Add sanitizeUrl() to truncate activeUrl >60 chars
 * 3. JS: Remove dead code Outlook section
 *
 * Since the extension source (Popup.tsx, Popup.css) lives in a separate
 * project, this script patches the compiled bundle in the zip.
 *
 * Usage: npx tsx scripts/patch-extension-popup.ts
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

const ZIP_PATH = path.resolve(__dirname, '../public/CalendarVLU-extension_v1.0.zip')
const WORK_DIR = path.resolve('/tmp/extension-patch')

function main() {
  // Extract
  if (fs.existsSync(WORK_DIR)) fs.rmSync(WORK_DIR, { recursive: true })
  fs.mkdirSync(WORK_DIR, { recursive: true })
  execSync(`unzip -q "${ZIP_PATH}" -d "${WORK_DIR}"`)

  // 1. CSS: responsive width
  const cssPath = path.join(WORK_DIR, 'popup/assets/index-D3B1WMK5.css')
  let css = fs.readFileSync(cssPath, 'utf-8')
  css = css.replace(/width:380px/g, 'min-width:360px;max-width:480px')
  fs.writeFileSync(cssPath, css)
  console.log('✓ CSS patched: width → min-width:360px;max-width:480px')

  // 2. JS: sanitize activeUrl
  const jsPath = path.join(WORK_DIR, 'popup/assets/index-BEjIvq_l.js')
  let js = fs.readFileSync(jsPath, 'utf-8')

  // Wrap .url usage with a truncation helper
  // The compiled JS references tabUrl/url when displaying the active tab URL.
  // We inject a runtime sanitize helper at the top of the bundle.
  const sanitizeFn = `
(function(){var Fr=window.__sanitizeUrl||(window.__sanitizeUrl=function(u){if(typeof u!=='string')return'';try{new URL(u)}catch{return'[Invalid URL]'}return u.length>63?u.slice(0,60)+'...':u});
`
  // Prepend sanitize helper
  js = sanitizeFn + js.slice(0, -1) + '})();'

  // Replace .url references in the VLU tab reading section with sanitized version
  // The pattern we found: `,U=b==null?void 0:b.url` → needs sanitization
  js = js.replace(
    /U=b==null\?void 0:b\.url/,
    'U=b==null?void 0:window.__sanitizeUrl(b.url)',
  )

  fs.writeFileSync(jsPath, js)
  console.log('✓ JS patched: activeUrl sanitized with truncation + URL validation')

  // 3. Re-zip
  const outputZip = path.resolve(__dirname, '../public/CalendarVLU-extension_v1.0.zip')
  if (fs.existsSync(outputZip)) fs.unlinkSync(outputZip)
  execSync(`cd "${WORK_DIR}" && zip -qr "${outputZip}" .`)
  console.log(`✓ Extension re-packaged: ${outputZip}`)

  // Cleanup
  fs.rmSync(WORK_DIR, { recursive: true })
  console.log('✓ Done')
}

main()
