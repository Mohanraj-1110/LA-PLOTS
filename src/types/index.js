/**
 * @file Types & JSDoc definitions for LA PLOTS Real Estate Plot Management System
 */

/**
 * @typedef {'available' | 'reserved' | 'sold' | 'blocked'} PlotStatus
 */

/**
 * @typedef {'North' | 'South' | 'East' | 'West' | 'North-East' | 'North-West' | 'South-East' | 'South-West' | 'Corner'} PlotFacing
 */

/**
 * @typedef {Object} Plot
 * @property {string} id
 * @property {string} projectId
 * @property {string} projectName
 * @property {string} location
 * @property {string} plotNumber
 * @property {string} surveyNumber
 * @property {number} areaSqft
 * @property {number} ratePerSqft
 * @property {number} totalAmount
 * @property {PlotStatus} status
 * @property {PlotFacing} facing
 * @property {number} roadWidth
 * @property {string} description
 * @property {string[]} [amenities]
 * @property {string[]} photos
 * @property {string[]} [documents]
 * @property {string} [coordinates]
 * @property {string} createdAt
 */

/**
 * @typedef {'New' | 'Interested' | 'Site Visit' | 'Negotiation' | 'Booked' | 'Follow-up' | 'Converted' | 'Lost'} LeadStatus
 */

/**
 * @typedef {Object} Customer
 * @property {string} id
 * @property {string} name
 * @property {string} phone
 * @property {string} email
 * @property {string} address
 * @property {string} city
 * @property {number} budgetMin
 * @property {number} budgetMax
 * @property {string} interestedProjectId
 * @property {string} interestedProjectName
 * @property {string} [interestedPlotId]
 * @property {string} [interestedPlotNumber]
 * @property {LeadStatus} status
 * @property {string} nextFollowup
 * @property {string} notes
 * @property {string} assignedAgent
 * @property {number} [leadScore]
 * @property {string} createdAt
 */

/**
 * @typedef {'Site Visit' | 'Office Meeting' | 'Document Meeting' | 'Follow-up Call' | 'Registration' | 'Payment'} AppointmentType
 */

/**
 * @typedef {'Upcoming' | 'Completed' | 'Cancelled' | 'Rescheduled'} AppointmentStatus
 */

/**
 * @typedef {Object} Appointment
 * @property {string} id
 * @property {string} customerId
 * @property {string} customerName
 * @property {string} customerPhone
 * @property {string} [plotId]
 * @property {string} [plotNumber]
 * @property {string} [projectName]
 * @property {AppointmentType} type
 * @property {string} date
 * @property {string} time
 * @property {AppointmentStatus} status
 * @property {string} location
 * @property {string} notes
 * @property {string} createdAt
 */

/**
 * @typedef {'Completed' | 'Pending' | 'Partial'} PaymentStatus
 */

/**
 * @typedef {Object} Sale
 * @property {string} id
 * @property {string} plotId
 * @property {string} plotNumber
 * @property {string} projectName
 * @property {string} customerId
 * @property {string} customerName
 * @property {number} saleAmount
 * @property {number} costAmount
 * @property {number} netProfit
 * @property {number} profitMargin
 * @property {string} saleDate
 * @property {PaymentStatus} paymentStatus
 * @property {string} paymentMethod
 * @property {string} agentName
 * @property {string} createdAt
 */

/**
 * @typedef {'Land Documents' | 'Layout Plans' | 'Sale Agreements' | 'Customer KYC' | 'Receipts' | 'Registration' | 'Other'} DocumentCategory
 */

/**
 * @typedef {Object} DocumentItem
 * @property {string} id
 * @property {string} name
 * @property {DocumentCategory} category
 * @property {string} fileUrl
 * @property {string} fileSize
 * @property {string} fileType
 * @property {string} [projectId]
 * @property {string} [projectName]
 * @property {string} [plotId]
 * @property {string} [plotNumber]
 * @property {string} [customerId]
 * @property {string} [customerName]
 * @property {string} uploadedBy
 * @property {string} uploadedAt
 */

/**
 * @typedef {'Website' | 'Facebook' | 'Instagram' | 'WhatsApp' | 'Reference' | 'Walk-in' | 'Advertisement' | 'Other'} EnquirySource
 */

/**
 * @typedef {'New' | 'Contacted' | 'Site Visit Planned' | 'Converted' | 'Dropped'} EnquiryStatus
 */

/**
 * @typedef {Object} Enquiry
 * @property {string} id
 * @property {string} customerName
 * @property {string} phone
 * @property {string} email
 * @property {string} project
 * @property {string} budget
 * @property {string} requirement
 * @property {EnquirySource} source
 * @property {EnquiryStatus} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {'agent' | 'customer'} sender
 * @property {string} text
 * @property {string} timestamp
 */

/**
 * @typedef {Object} MessageConversation
 * @property {string} id
 * @property {string} customerId
 * @property {string} customerName
 * @property {string} customerPhone
 * @property {string} customerAvatar
 * @property {string} lastMessage
 * @property {string} timestamp
 * @property {number} unreadCount
 * @property {ChatMessage[]} messages
 */

/**
 * @typedef {'Admin' | 'Manager' | 'Agent'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {UserRole} role
 * @property {string} avatar
 * @property {string} company
 * @property {string} createdAt
 */

export {};
