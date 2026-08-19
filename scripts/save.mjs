import { execSync } from 'node:child_process'

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' })
}

const message = process.argv.slice(2).join(' ')

const hasChanges = execSync('git status --porcelain').toString().trim().length > 0

if (!hasChanges) {
  console.log('Nada para commitar. Verificando se há commits para enviar...')
} else {
  if (!message) {
    console.error('Uso: npm run save -- "mensagem descrevendo o que mudou"')
    process.exit(1)
  }
  run('git add -A')
  run(`git commit -m ${JSON.stringify(message)}`)
}

run('git push')
