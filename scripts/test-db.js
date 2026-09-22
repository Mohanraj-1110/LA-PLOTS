import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'
import path from 'path'

dotenv.config()

async function testMongoDB() {
  console.log('\n=============================================================')
  console.log('🔍 LK PROPERTIES — MongoDB Atlas Connectivity & Data Test')
  console.log('=============================================================\n')

  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.log('❌ MONGODB_URI is not set in your .env file.')
    console.log('👉 Please open .env and configure your MONGODB_URI.\n')
    process.exit(1)
  }

  // Check if placeholder is still present
  if (uri.includes('<db_password>') || uri.includes('<password>')) {
    console.log('❌ [TEST FAILED]: MONGODB_URI still contains the placeholder `<db_password>`!')
    console.log('\nYour current MONGODB_URI is:')
    console.log(`  ${uri}\n`)
    console.log('👉 ACTION REQUIRED:')
    console.log('  1. Open .env file in the root folder.')
    console.log('  2. Replace `<db_password>` with your real password for database user "lkproperties153_db_user".')
    console.log('  3. In MongoDB Atlas, make sure Network Access allows IP 0.0.0.0/0.')
    console.log('  4. Re-run this test script: node scripts/test-db.js\n')
    console.log('⚠️ Because the password has not been replaced yet, NO data can be stored in MongoDB Atlas.')
    console.log('=============================================================\n')
    process.exit(0)
  }

  // Masked URI display
  const maskedUri = uri.replace(/:([^:@]+)@/, ':****@')
  console.log(`📡 Connecting to: ${maskedUri} ...`)

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 10000,
    })

    console.log('✅ [CONNECTED]: Successfully connected to MongoDB Atlas!\n')
    console.log(`📦 Cluster Host : ${conn.connection.host}`)
    console.log(`🗄️  Database Name: ${conn.connection.name}\n`)

    const db = conn.connection.db

    // --- LIVE READ / WRITE TEST ---
    console.log('📝 Testing Live READ & WRITE Operations on MongoDB Atlas...')
    const testColl = db.collection('_atlas_rw_verification')
    const testDocId = `test_${Date.now()}`
    
    // 1. Write Test
    console.log(`   1. WRITE: Inserting test document (id: ${testDocId}) into Atlas...`)
    await testColl.insertOne({
      _id: testDocId,
      message: 'MongoDB Atlas Read/Write Verification Test',
      timestamp: new Date(),
      status: 'active'
    })
    console.log('      -> ✅ WRITE SUCCESS: Document successfully inserted into MongoDB Atlas!')

    // 2. Read Test
    console.log(`   2. READ : Fetching test document back from Atlas...`)
    const retrieved = await testColl.findOne({ _id: testDocId })
    if (retrieved && retrieved.status === 'active') {
      console.log('      -> ✅ READ SUCCESS: Retrieved document directly from MongoDB Atlas:')
      console.log(`         Content: "${retrieved.message}" (created at ${retrieved.timestamp})`)
    } else {
      throw new Error('Read verification failed: document could not be retrieved from Atlas')
    }

    // 3. Clean up
    await testColl.deleteOne({ _id: testDocId })
    console.log('      -> 🧹 Cleaned up temporary test document.\n')
    console.log('🌟 READ & WRITE CONFIRMED: MongoDB Atlas is fully operational (NOT using temporary/memory store)!\n')

    // 4. Check existing collections in Atlas
    const collections = await db.listCollections().toArray()
    console.log('📊 Current Collections in MongoDB Atlas (`la_plots`):')
    console.log('-------------------------------------------------------------')
    if (collections.length === 0) {
      console.log('ℹ️  The database currently has 0 collections.')
      console.log('   (They are created automatically when the backend saves projects, plots, or customers).\n')
    } else {
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments()
        console.log(`  • ${col.name.padEnd(20)}: ${count} record(s)`)
      }
      console.log('-------------------------------------------------------------\n')
    }
  } catch (err) {
    console.log('\n❌ [CONNECTION FAILED]: Could not connect to MongoDB Atlas.')
    console.log(`   Error: ${err.message}\n`)

    if (err.message.includes('whitelist') || err.message.includes('Could not connect to any servers')) {
      console.log('👉 IP WHITELIST ISSUE:')
      console.log('   In MongoDB Atlas -> Network Access -> Add IP Address -> Choose "Allow Access From Anywhere" (0.0.0.0/0).\n')
    } else if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.log('👉 AUTHENTICATION ISSUE:')
      console.log('   The password in .env does not match user "lkproperties153_db_user".')
      console.log('   In MongoDB Atlas -> Database Access -> Edit lkproperties153_db_user -> set password.\n')
    }
    console.log('=============================================================\n')
  } finally {
    try {
      await mongoose.disconnect()
    } catch {}
  }
}

testMongoDB()
