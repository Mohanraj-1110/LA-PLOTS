import { Plot } from './models/Plot.js'
import { Customer } from './models/Customer.js'
import { Appointment } from './models/Appointment.js'
import { Sale } from './models/Sale.js'
import { Document } from './models/Document.js'
import { Enquiry } from './models/Enquiry.js'
import { Conversation } from './models/Message.js'

import { initialPlots } from '../src/data/mockPlots.js'
import { initialCustomers } from '../src/data/mockCustomers.js'
import { initialAppointments } from '../src/data/mockAppointments.js'
import { initialSales } from '../src/data/mockSales.js'
import { initialDocuments } from '../src/data/mockDocuments.js'
import { initialEnquiries } from '../src/data/mockEnquiries.js'
import { initialConversations } from '../src/data/mockMessages.js'

export async function seedDatabaseIfEmpty() {
  try {
    const plotCount = await Plot.countDocuments()
    if (plotCount === 0) {
      console.log('[MongoDB Atlas Seed] Seeding initial plots...')
      const formattedPlots = initialPlots.map((p) => {
        let geo = p.geo || { lat: 13.0827, lng: 80.2707 }
        if (p.coordinates && typeof p.coordinates === 'string') {
          const parts = p.coordinates.split(',')
          if (parts.length >= 2) {
            geo = {
              lat: parseFloat(parts[0]) || 13.0827,
              lng: parseFloat(parts[1]) || 80.2707,
            }
          }
        }
        return {
          id: p.id,
          projectId: p.projectId || 'proj-01',
          plotNumber: p.plotNumber,
          surveyNumber: p.surveyNumber || '',
          areaSqft: p.areaSqft,
          ratePerSqft: p.ratePerSqft,
          totalAmount: p.totalAmount,
          status: p.status || 'available',
          facing: p.facing || 'East',
          roadWidth: p.roadWidth || 30,
          photos: p.photos || [],
          documents: p.documents || [],
          geo,
          location: p.location || 'Devanahalli, North Bengaluru',
          description: p.description || '',
          tags: p.amenities || [],
        }
      })
      await Plot.insertMany(formattedPlots)
      console.log(`[MongoDB Atlas Seed] Inserted ${formattedPlots.length} plots.`)
    }

    const customerCount = await Customer.countDocuments()
    if (customerCount === 0) {
      console.log('[MongoDB Atlas Seed] Seeding initial customers...')
      const formattedCustomers = initialCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email || '',
        address: c.address || '',
        budget: c.budget || 0,
        interestedProjectId: c.interestedProjectId || '',
        interestedPlotId: c.interestedPlotId || '',
        status: (c.status || 'lead').toLowerCase(),
        nextFollowupDate: c.nextFollowupDate || '',
        notes: c.notes || '',
        assignedAgentId: c.assignedAgentId || '',
      }))
      await Customer.insertMany(formattedCustomers)
      console.log(`[MongoDB Atlas Seed] Inserted ${formattedCustomers.length} customers.`)
    }

    const appointmentCount = await Appointment.countDocuments()
    if (appointmentCount === 0) {
      console.log('[MongoDB Atlas Seed] Seeding initial appointments...')
      const formattedAppointments = initialAppointments.map((a) => ({
        id: a.id,
        customerId: a.customerId || '',
        customerName: a.customerName || '',
        plotId: a.plotId || '',
        plotNumber: a.plotNumber || '',
        type: (a.type || 'site visit').toLowerCase(),
        date: a.date || new Date().toISOString().slice(0, 10),
        time: a.time || '10:00 AM',
        status: (a.status || 'scheduled').toLowerCase(),
        notes: a.notes || '',
        assignedAgentId: a.assignedAgentId || '',
      }))
      await Appointment.insertMany(formattedAppointments)
      console.log(`[MongoDB Atlas Seed] Inserted ${formattedAppointments.length} appointments.`)
    }

    const saleCount = await Sale.countDocuments()
    if (saleCount === 0) {
      console.log('[MongoDB Atlas Seed] Seeding initial sales...')
      const formattedSales = initialSales.map((s) => ({
        id: s.id,
        plotId: s.plotId,
        plotNumber: s.plotNumber || '',
        customerId: s.customerId || '',
        customerName: s.customerName || '',
        saleAmount: s.saleAmount,
        cost: s.cost || 0,
        profit: s.profit || (s.saleAmount - (s.cost || 0)),
        saleDate: s.saleDate || new Date().toISOString(),
        paymentStatus: (s.paymentStatus || 'completed').toLowerCase(),
        agentId: s.agentId || '',
      }))
      await Sale.insertMany(formattedSales)
      console.log(`[MongoDB Atlas Seed] Inserted ${formattedSales.length} sales.`)
    }

    const documentCount = await Document.countDocuments()
    if (documentCount === 0) {
      console.log('[MongoDB Atlas Seed] Seeding initial documents...')
      const formattedDocuments = initialDocuments.map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category || 'Other',
        fileUrl: d.fileUrl || '',
        fileSize: d.fileSize || '1.2 MB',
        fileType: d.fileType || 'PDF',
        projectId: d.projectId || 'proj-1',
        plotId: d.plotId || '',
        customerId: d.customerId || '',
        uploadedBy: d.uploadedBy || 'Admin',
        uploadedAt: d.uploadedAt || new Date().toISOString(),
      }))
      await Document.insertMany(formattedDocuments)
      console.log(`[MongoDB Atlas Seed] Inserted ${formattedDocuments.length} documents.`)
    }

    const enquiryCount = await Enquiry.countDocuments()
    if (enquiryCount === 0) {
      console.log('[MongoDB Atlas Seed] Seeding initial enquiries...')
      const formattedEnquiries = initialEnquiries.map((e) => ({
        id: e.id,
        customerName: e.customerName || e.name || 'Enquiry Lead',
        phone: e.phone || '',
        email: e.email || '',
        projectId: e.projectId || 'proj-01',
        plotId: e.plotId || '',
        budget: e.budget || 0,
        source: e.source || 'Website',
        status: (e.status || 'new').toLowerCase(),
        requirement: e.requirement || e.notes || '',
        assignedAgentId: e.assignedAgentId || '',
        assignedAgentName: e.assignedAgentName || '',
      }))
      await Enquiry.insertMany(formattedEnquiries)
      console.log(`[MongoDB Atlas Seed] Inserted ${formattedEnquiries.length} enquiries.`)
    }

    const conversationCount = await Conversation.countDocuments()
    if (conversationCount === 0) {
      console.log('[MongoDB Atlas Seed] Seeding initial conversations...')
      const formattedConversations = initialConversations.map((c) => ({
        id: c.id,
        customerId: c.customerId || '',
        customerName: c.customerName || '',
        customerPhone: c.customerPhone || '',
        customerAvatar: c.customerAvatar || '',
        lastMessage: c.lastMessage || '',
        timestamp: c.timestamp || new Date().toISOString(),
        unreadCount: c.unreadCount || 0,
        messages: c.messages || [],
      }))
      await Conversation.insertMany(formattedConversations)
      console.log(`[MongoDB Atlas Seed] Inserted ${formattedConversations.length} conversations.`)
    }

    console.log('[MongoDB Atlas Seed] Database verification/seeding completed successfully.')
  } catch (err) {
    console.error('[MongoDB Atlas Seed] Notice during seeding:', err.message)
  }
}
