// Generate the fill-in herd spreadsheet (xlsx) with one column per field and
// dropdowns for the pick-list columns. Usage: node scripts/gen-template.mjs <out.xlsx>
import ExcelJS from 'exceljs'

const out = process.argv[2] || 'herd-template.xlsx'

const COLS = [
  { header: 'Tag', key: 'tag', width: 12, note: 'Required. Exactly as on the tag (e.g. K16, 48W).' },
  { header: 'Name', key: 'name', width: 16, note: 'Optional.' },
  { header: 'Type', key: 'type', width: 18, list: 'Cow,Bull,Calf,Heifer,Steer,Show Steer/Heifer,Horse,Pig,Donkey' },
  { header: 'Breed', key: 'breed', width: 14, list: 'Angus,Milk Cow', free: true },
  { header: 'Color', key: 'color', width: 12, list: 'Black,Red,Red/White,Black/White,Roan,Bay,Sorrel,Grey,White,Spotted', free: true },
  { header: 'Sex', key: 'sex', width: 8, list: 'F,M' },
  { header: 'Status', key: 'status', width: 12, list: 'Active,Sold,Deceased,Cull' },
  { header: 'Birth Date', key: 'birth', width: 13, date: true },
  { header: 'Purchase Date', key: 'purchase', width: 14, date: true },
  { header: 'Dam Tag', key: 'dam', width: 11, note: "Mother's tag # (links calf to cow)." },
  { header: 'Sire Tag', key: 'sire', width: 11, note: "Bull's tag # (natural service)." },
  { header: 'Registry (Gen/Val)', key: 'registry', width: 16, list: 'Gen,Val' },
  { header: 'AI Date', key: 'aiDate', width: 12, date: true, note: 'For AI cows only.' },
  { header: 'Semen/Sire', key: 'semen', width: 18, note: 'AI sire / semen name or code.' },
  { header: 'Birth Wt', key: 'birthWt', width: 9, note: 'Birth weight (lb).' },
  { header: 'Weaning Date', key: 'weaningDate', width: 13, date: true },
  { header: 'Weaning Wt', key: 'weaningWt', width: 11, note: 'Weaning weight (lb).' },
  { header: 'Adj Weaning Wt', key: 'adjWt', width: 13, note: 'Adjusted (205-day) weaning weight.' },
  { header: 'Daily Gain', key: 'adg', width: 10, note: 'Average daily gain (ADG).' },
  { header: 'Herd Index', key: 'herdIndex', width: 10 },
  { header: 'Quality Score', key: 'qualityScore', width: 12, note: 'e.g. 15.5 or Choice.' },
  { header: 'Yearling Wt', key: 'yearlingWt', width: 11 },
  { header: 'Yearling Gain', key: 'yearlingGain', width: 12 },
  { header: 'Notes', key: 'notes', width: 28, note: 'Remarks (health, sale info, disposition…).' },
]

const wb = new ExcelJS.Workbook()
wb.creator = 'Sand Creek Cattle'
const ws = wb.addWorksheet('Herd', { views: [{ state: 'frozen', ySplit: 1 }] })
ws.columns = COLS.map((c) => ({ header: c.header, key: c.key, width: c.width }))

// Header styling — cobalt fill, white bold text.
ws.getRow(1).height = 22
ws.getRow(1).eachCell((cell) => {
  cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E35D4' } }
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
})

// One example row so they can see the shape (delete before importing is fine —
// the importer skips tags that already exist and ignores blank rows).
ws.addRow({
  tag: 'K16', name: '', type: 'Cow', breed: 'Angus', color: 'Black', sex: 'F',
  status: 'Active', birth: '', purchase: '', dam: '', sire: '', registry: 'Gen',
  aiDate: '', semen: '', notes: 'Example row — replace or delete',
})

const LAST = 600
for (let r = 2; r <= LAST; r++) {
  for (let i = 0; i < COLS.length; i++) {
    const c = COLS[i]
    const cell = ws.getCell(r, i + 1)
    if (c.list) {
      cell.dataValidation = {
        type: 'list',
        allowBlank: true,
        // `free` lists suggest values but don't reject typed-in ones.
        showErrorMessage: !c.free,
        formulae: [`"${c.list}"`],
      }
    }
    if (c.date) cell.numFmt = 'mm/dd/yyyy'
  }
}

// Guide sheet — plain-language help.
const guide = wb.addWorksheet('Guide')
guide.columns = [
  { header: 'Column', key: 'col', width: 20 },
  { header: 'What to put', key: 'desc', width: 80 },
]
guide.getRow(1).eachCell((cell) => {
  cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E35D4' } }
})
for (const c of COLS) guide.addRow({ col: c.header, desc: c.note ?? (c.list ? `Pick from: ${c.list}` : '') })
guide.addRow({})
guide.addRow({ col: 'Bulls', desc: 'Set Type = Bull for the 7 herd bulls (Sex fills in as M).' })
guide.addRow({ col: 'Angus color', desc: 'Breed is just "Angus"; put Black or Red in the Color column.' })
guide.addRow({ col: 'Calves', desc: 'Put the mother\'s tag in Dam Tag to link the pair.' })
guide.addRow({ col: 'AI cows', desc: 'Fill AI Date + Semen/Sire only for the ones that were AI\'d.' })

await wb.xlsx.writeFile(out)
console.log('wrote', out)
