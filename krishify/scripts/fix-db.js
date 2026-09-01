const fs = require('fs')
const path = require('path')

function walk(dir) {
  let files = []
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f)
    const stat = fs.statSync(full)
    if (stat.isDirectory() && f !== 'node_modules' && f !== '.next') {
      files = files.concat(walk(full))
    } else if (f.endsWith('.js')) {
      files.push(full)
    }
  })
  return files
}

const base = path.join(__dirname, '..')
const apiDir = path.join(base, 'pages/api')
const libDir = path.join(base, 'lib')

const allFiles = walk(apiDir).concat(
  walk(libDir).filter(f => !f.endsWith('db.js'))
)

// Relative path from a file to lib/db
function relPath(fromFile) {
  const rel = path.relative(path.dirname(fromFile), path.join(base, 'lib/db'))
  return rel.startsWith('.') ? rel : './' + rel
}

let fixed = 0

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8')

  // Skip if already uses getPool
  if (content.includes('getPool') || content.includes("lib/db'")) return
  // Skip if no hardcoded mysql pool
  if (!content.includes("host: \"localhost\"") && !content.includes("host: 'localhost'")) return

  const rel = relPath(file).replace(/\\/g, '/')

  // Replace mysql2/promise require with getPool import
  let result = content
    .replace(/const mysql = require\("mysql2\/promise"\)\s*\n/, `const { getPool } = require('${rel}')\n`)
    .replace(/const mysql = require\('mysql2\/promise'\)\s*\n/, `const { getPool } = require('${rel}')\n`)

  // Replace pool definitions
  const poolDefRegex = /const pool = mysql\.createPool\(\s*\{[\s\S]*?waitForConnections[\s\S]*?\}\s*\)/g
  result = result.replace(poolDefRegex, 'const pool = getPool()')

  // Replace inline await mysql.createPool({...})
  const inlineRegex = /await mysql\.createPool\(\s*\{[\s\S]*?waitForConnections[\s\S]*?\}\s*\)/g
  result = result.replace(inlineRegex, 'getPool()')

  // Replace bare mysql.createPool({...}) 
  const bareRegex = /mysql\.createPool\(\s*\{[\s\S]*?waitForConnections[\s\S]*?\}\s*\)/g
  result = result.replace(bareRegex, 'getPool()')

  if (result !== content) {
    fs.writeFileSync(file, result)
    fixed++
    console.log('fixed: ' + file.replace(base + '/', ''))
  }
})

console.log('\nTotal fixed: ' + fixed)
