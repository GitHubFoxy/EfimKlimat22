#!/usr/bin/env node
import { ConvexClient } from 'convex/browser'
import * as fs from 'fs'
import * as path from 'path'
import { api } from './convex/_generated/api.js'

const CONVEX_URL = 'https://grandiose-puffin-672.convex.cloud'

const client = new ConvexClient(CONVEX_URL)

const dataDir = path.join(
  import.meta.dirname,
  '..',
  'move-to-new-schema',
  'migrated_data',
)

// Load one cart document
const cartsPath = path.join(dataDir, 'carts.jsonl')
const content = fs.readFileSync(cartsPath, 'utf-8')
const lines = content.split('\n').filter((l) => l.trim())
const cartDoc = JSON.parse(lines[0])

console.log('Testing insert with:', JSON.stringify(cartDoc, null, 2))

const { _id, _creationTime, ...docToImport } = cartDoc

console.log('\nInserting:', JSON.stringify(docToImport, null, 2))

try {
  const result = await client.mutation(api.import.insertDoc, {
    collection: 'carts',
    doc: docToImport,
  })

  console.log('Result:', result)
} catch (error) {
  console.error('Error:', error)
  if (error instanceof Error) {
    console.error('Message:', error.message)
  }
}
