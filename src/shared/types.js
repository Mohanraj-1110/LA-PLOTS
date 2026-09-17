/**
 * @typedef {Object} User
 * @property {string} uid
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {'admin' | 'agent' | 'customer'} role
 * @property {string} photoURL
 * @property {string[]} [kycDocuments]
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} location
 * @property {string} description
 * @property {number} totalPlots
 * @property {string} coverImage
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {Object} Plot
 * @property {string} id
 * @property {string} projectId
 * @property {string} plotNumber
 * @property {string} surveyNumber
 * @property {number} areaSqft
 * @property {number} ratePerSqft
 * @property {number} totalAmount
 * @property {'available' | 'reserved' | 'sold' | 'blocked'} status
 * @property {string} facing
 * @property {number} roadWidth
 * @property {string[]} photos
 * @property {string[]} documents
 * @property {{ lat: number; lng: number }} geo
 * @property {string} [location]
 * @property {string} [description]
 */

/**
 * @typedef {Object} Customer
 * @property {string} id
 * @property {string} name
 * @property {string} phone
 * @property {string} email
 * @property {string} address
 * @property {number} budget
 * @property {string} interestedProjectId
 * @property {string} interestedPlotId
 * @property {string} status
 * @property {import('firebase/firestore').Timestamp} nextFollowupDate
 * @property {string} notes
 * @property {string} assignedAgentId
 */

/**
 * @typedef {Object} Appointment
 * @property {string} id
 * @property {string} customerId
 * @property {string} plotId
 * @property {'site visit' | 'meeting' | 'call' | 'registration' | 'payment'} type
 * @property {import('firebase/firestore').Timestamp} date
 * @property {string} time
 * @property {string} status
 * @property {string} notes
 */

/**
 * @typedef {Object} Sale
 * @property {string} id
 * @property {string} plotId
 * @property {string} customerId
 * @property {number} saleAmount
 * @property {number} cost
 * @property {number} profit
 * @property {import('firebase/firestore').Timestamp} saleDate
 * @property {string} paymentStatus
 */

/**
 * @typedef {Object} Document
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} fileUrl
 * @property {string} projectId
 * @property {string} plotId
 * @property {string} customerId
 * @property {string} uploadedBy
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {Object} Enquiry
 * @property {string} id
 * @property {string} customerName
 * @property {string} phone
 * @property {string} projectId
 * @property {number} budget
 * @property {string} source
 * @property {string} status
 * @property {string} [requirement]
 * @property {string} [assignedAgentId]
 * @property {string} [assignedAgentName]
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {Object} Wishlist
 * @property {string} id
 * @property {string} customerId
 * @property {string} plotId
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} customerId
 * @property {string} customerName
 * @property {string} agentId
 * @property {string} body
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} customerId
 * @property {string} [plotId]
 * @property {string} [projectId]
 * @property {number} rating
 * @property {string} comment
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} userId
 * @property {string} title
 * @property {string} message
 * @property {string} type
 * @property {boolean} isRead
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {Object} CompanySettings
 * @property {string} id
 * @property {string} name
 * @property {string} phone
 * @property {string} email
 * @property {string} address
 * @property {import('firebase/firestore').Timestamp} updatedAt
 */

export {}
