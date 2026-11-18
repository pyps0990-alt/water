// Admin flow against emulators: login → open case → advance status → notes → quote → print → schedule → settings.
const { chromium } = require('playwright')
const out = process.argv[2] || '.'
const ok = (c, m) => { console.log(c ? 'PASS' : 'FAIL', m); if (!c) process.exitCode = 1 }
const B = 'http://127.0.0.1:4173'

;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 390, height: 844 } })
  const errs = []; p.on('pageerror', (e) => errs.push(e.message))

  // create a case through the public form
  await p.goto(`${B}/?source=line#book`, { waitUntil: 'networkidle' })
  await p.getByLabel('姓名／稱呼').fill('王小姐')
  await p.getByLabel('手機').fill('0987654321')
  await p.getByLabel('地區').fill('台北市信義區')
  await p.getByLabel('地址').fill('松仁路 100 號')
  await p.getByLabel('問題描述').fill('浴室天花板漏水，樓上住戶說不是他們')
  await p.getByRole('button', { name: '送出場勘預約' }).click()
  const caseId = await p.locator('strong', { hasText: /^WE-/ }).textContent({ timeout: 30000 })
  ok(!!caseId, `public case ${caseId}`)

  // admin login (emulator)
  await p.goto(`${B}/admin`, { waitUntil: 'networkidle' })
  await p.getByRole('button', { name: '模擬器測試登入' }).click()
  await p.getByRole('heading', { name: '案件' }).waitFor({ timeout: 20000 })
  ok(true, 'admin signed in')
  await p.getByRole('link', { name: new RegExp(caseId) }).click()
  await p.getByRole('heading', { name: caseId }).waitFor()
  await p.screenshot({ path: `${out}/admin-case.png`, fullPage: false })

  // advance status with confirmation
  await p.getByRole('button', { name: /推進到「待場勘」/ }).click()
  await p.getByRole('button', { name: '確認變更' }).click()
  await p.locator('[aria-current=step]', { hasText: '待場勘' }).waitFor({ timeout: 10000 })
  ok(true, 'status advanced to 待場勘')

  // notes
  await p.getByLabel('場勘筆記（僅內部可見）').fill('樓上浴室排水管接頭滲漏，需開天花板')
  await p.getByRole('button', { name: '儲存筆記' }).click()
  await p.getByText('已儲存').waitFor()
  ok(true, 'survey notes saved')

  // quote: 2 items, tax, discount
  const items = p.getByRole('list', { name: '報價項目' }).locator('> li')
  await items.nth(0).getByLabel('項目名稱').fill('天花板開孔與復原')
  await items.nth(0).getByLabel('單價').fill('6000')
  await p.getByRole('button', { name: '新增項目' }).click()
  await items.nth(1).getByLabel('項目名稱').fill('排水管接頭更換')
  await items.nth(1).getByLabel('規格／品牌').fill('南亞 PVC 2"')
  await items.nth(1).getByLabel('數量').fill('2')
  await items.nth(1).getByLabel('單價').fill('1500')
  await p.getByLabel('外加 5% 營業稅（開立發票）').check()
  await p.getByLabel('折讓金額').fill('1000')
  const total = await p.getByTestId('quote-total').textContent()
  ok(total.replace(/\s/g, '') === 'NT$8,400', `live total ${total} (9000−1000 +5%)`)
  await p.getByRole('button', { name: '儲存並列印 A4' }).click()
  await p.locator('.a4-page').first().waitFor({ timeout: 15000 })
  const doc = await p.locator('.a4-page').first().textContent()
  ok(doc.includes('王小姐') && doc.includes('NT$ 8,400') && doc.includes('排水管接頭更換'), 'print view shows saved quote')
  await p.screenshot({ path: `${out}/admin-print.png` })

  // schedule: close tomorrow, check public board
  await p.goto(`${B}/admin/schedule`, { waitUntil: 'networkidle' })
  const tomorrow = p.getByRole('radiogroup').nth(1)
  await tomorrow.getByRole('radio', { name: '休息' }).click()
  await p.waitForTimeout(800)
  await p.goto(`${B}/#schedule`, { waitUntil: 'networkidle' })
  const cells = p.getByRole('list', { name: '每日檔期' }).locator('li[aria-label]')
  ok((await cells.nth(1).getAttribute('aria-label')).includes('休息'), 'public board shows tomorrow as 休息')

  // settings → public footer
  await p.goto(`${B}/admin/settings`, { waitUntil: 'networkidle' })
  await p.getByLabel('工作室名稱').fill('七堵水電工作室')
  await p.getByRole('button', { name: '儲存設定' }).click()
  await p.getByText('設定已儲存').waitFor()
  await p.goto(`${B}/`, { waitUntil: 'networkidle' })
  ok(await p.getByText('七堵水電工作室').first().isVisible(), 'public site uses saved company name')

  ok(errs.length === 0, `no page errors ${errs.join(' | ')}`)
  await b.close()
})()
