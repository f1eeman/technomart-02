import { writeFile } from 'node:fs/promises'
import process from 'node:process'

import openapiTS, { astToString } from 'openapi-typescript'
import { format, resolveConfig } from 'prettier'

const url =
  process.env.API_SCHEMA_URL ?? 'http://localhost:3000/api/openapi.json'
const out = 'src/types/api.d.ts'

const ast = await openapiTS(new URL(url))
const options = await resolveConfig(out)
const code = await format(astToString(ast), {
  ...options,
  filepath: out,
  parser: 'typescript',
})

await writeFile(out, code, 'utf8')

console.log(`Типы API записаны в ${out} (схема: ${url})`)
