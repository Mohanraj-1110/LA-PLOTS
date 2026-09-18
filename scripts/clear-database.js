import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Plot } from '../server/models/Plot.js'
import { Customer } from '../server/models/Customer.js'
import { Appointment } from '../server/models/Appointment.js'
import { Sale } from '../server/models/Sale.js'
import { Document } from '../server/models/Document.js'
import { Enquiry } from '../server/models/Enquiry.js'
import { Conversation } from '../server/models/Message.js'
import { User } from '../server/models/User.js'
import { Wishlist } from '../server/models/Wishlist.js'
import { Review } from '../server/models/Review.js'

dotenv.config()

async function clearDatabase() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI not found in .env')
    process.exit(1)
  }

  console.log('Connecting to MongoDB Atlas...')
  await mongoose.connect(uri)
  console.log('Connected to:', mongoose.connection.host, '/', mongoose.connection.name)

  console.log('\n--- Purging All Test / Mock Data ---')
  const rPlots = await Plot.deleteMany({})
  console.log(`Deleted ${rPlots.deletedCount} plots.`)

  const rCustomers = await Customer.deleteMany({})
  console.log(`Deleted ${rCustomers.deletedCount} customers.`)

  const rAppointments = await Appointment.deleteMany({})
  console.log(`Deleted ${rAppointments.deletedCount} appointments.`)

  const rSales = await Sale.deleteMany({})
  console.log(`Deleted ${rSales.deletedCount} sales.`)

  const rDocs = await Document.deleteMany({})
  console.log(`Deleted ${rDocs.deletedCount} documents.`)

  const rEnquiries = await Enquiry.deleteMany({})
  console.log(`Deleted ${rEnquiries.deletedCount} enquiries.`)

  const rConversations = await Conversation.deleteMany({})
  console.log(`Deleted ${rConversations.deletedCount} conversations.`)

  const rUsers = await User.deleteMany({})
  console.log(`Deleted ${rUsers.deletedCount} users.`)

  const rWishlists = await Wishlist.deleteMany({})
  console.log(`Deleted ${rWishlists.deletedCount} wishlists.`)

  const rReviews = await Review.deleteMany({})
  console.log(`Deleted ${rReviews.deletedCount} reviews.`)

  console.log('\n✅ All test records removed! MongoDB Atlas is now completely clean and empty for production.\n')
  await mongoose.disconnect()
  process.exit(0)
}

clearDatabase().catch((err) => {
  console.error('Error clearing database:', err)
  process.exit(1)
})
