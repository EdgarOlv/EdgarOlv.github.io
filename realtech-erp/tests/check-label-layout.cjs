// Requer Playwright e Microsoft Edge disponíveis no ambiente de validação.
const { chromium } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
;(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' })
  try {
    const page = await browser.newPage()
    await page.goto(pathToFileURL(path.resolve(__dirname, '../conferencia-etiquetas.html')).href)
    const source = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8')
    await page.addScriptTag({ content: source.slice(source.indexOf('function fitLabelText()'), source.indexOf("window.addEventListener('resize', fitLabelText)")) })
    await page.evaluate(() => document.fonts.ready)
    for (const width of [735, 360, 397]) {
      for (const name of ['JUSSARA ALIMENTOS - SP', 'ALIMENTOS DO NORTE — DEMONSTRAÇÃO', 'INDÚSTRIA E COMÉRCIO DE ALIMENTOS DO NORTE COM DISTRIBUIÇÃO NACIONAL — DEMONSTRAÇÃO', 'CLIENTESEMESPACOS'.repeat(8)]) {
        const result = await page.evaluate(({ width, name }) => {
          document.querySelector('.label-frame-grande').style.width = `${width}px`
          const el = document.querySelector('.label-customer strong')
          el.textContent = name
          fitLabelText()
          const range = document.createRange()
          range.selectNodeContents(el)
          const text = range.getBoundingClientRect()
          const block = el.getBoundingClientRect()
          return { fits: text.top >= block.top - 1 && text.bottom <= block.bottom + 1 && text.left >= block.left - 1 && text.right <= block.right + 1, size: getComputedStyle(el).fontSize }
        }, { width, name })
        if (!result.fits) throw new Error(JSON.stringify({ width, name, result }))
        console.log(`${width}px: ${name.slice(0, 30)}: OK (${result.size})`)
      }
    }
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
