// End-to-end check of the public portal against the Firebase emulators.
const { chromium } = require('playwright')
const zlib = require('zlib')
const out = process.argv[2] || '.'

function png(w, h) { // tiny valid PNG, solid color
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]) }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2
  const raw = Buffer.alloc((w * 3 + 1) * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * (w * 3 + 1) + 1 + x * 3; raw[i] = 30; raw[i + 1] = 64; raw[i + 2] = 175 }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}
const ok = (c, m) => { console.log(c ? 'PASS' : 'FAIL', m); if (!c) process.exitCode = 1 }

;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 390, height: 844 } })
  const errs = []; p.on('pageerror', (e) => errs.push(e.message))
  await p.goto('http://127.0.0.1:4173/?source=ig#book', { waitUntil: 'networkidle' })

  // validation
  await p.getByRole('button', { name: '送出場勘預約' }).click()
  ok(await p.getByText('請填寫姓名或稱呼').isVisible(), 'empty form shows field errors')

  await p.getByLabel('姓名／稱呼').fill('測試客戶')
  await p.getByLabel('手機').fill('0912345678')
  await p.getByLabel('地區').fill('基隆市七堵區')
  await p.getByLabel('地址').fill('測試路 1 號')
  await p.getByLabel('問題描述').fill('開冷氣就跳電，想換總開關箱')
  await p.locator('input[type=file]').setInputFiles({ name: 'site.png', mimeType: 'image/png', buffer: png(2400, 1800) })
  await p.getByRole('img', { name: '現場照片 1' }).waitFor({ timeout: 30000 })
  ok(true, 'photo compressed and previewed')

  await p.getByRole('button', { name: '送出場勘預約' }).click()
  const idEl = p.locator('strong', { hasText: /^WE-\d{8}-\d{2}$/ })
  await idEl.waitFor({ timeout: 30000 })
  const caseId = await idEl.textContent()
  ok(/^WE-/.test(caseId), `case created → ${caseId}`)

  await p.getByLabel('案件編號').fill(caseId)
  await p.getByLabel('電話末三碼').fill('678')
  await p.getByRole('button', { name: '查詢', exact: true }).click()
  await p.getByText('目前狀態').waitFor({ timeout: 15000 })
  ok(await p.locator('[aria-current=step]').textContent().then((t) => t.includes('安排中')), 'status lookup shows 安排中 as current step')

  ok(errs.length === 0, `no page errors ${errs.join(' | ')}`)
  await b.close()
})()
