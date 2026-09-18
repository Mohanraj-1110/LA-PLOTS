import { z } from 'zod';

/**
 * Zod validation schema for Plots
 */
export const plotSchema = z.object({
  plotNumber: z.string().min(1, 'Plot number is required').max(30),
  surveyNumber: z.string().min(1, 'Survey / Khasra number is required'),
  projectName: z.string().min(2, 'Project name is required'),
  location: z.string().min(2, 'Location is required'),
  areaSqft: z.coerce
    .number({ invalid_type_error: 'Area must be a valid number' })
    .positive('Area must be greater than 0'),
  ratePerSqft: z.coerce
    .number({ invalid_type_error: 'Rate must be a valid number' })
    .positive('Rate must be greater than 0'),
  facing: z.enum([
    'North',
    'South',
    'East',
    'West',
    'North-East',
    'North-West',
    'South-East',
    'South-West',
    'Corner',
  ]),
  roadWidth: z.coerce
    .number({ invalid_type_error: 'Road width must be a number' })
    .min(10, 'Road width must be at least 10 ft'),
  status: z.enum(['available', 'reserved', 'sold', 'blocked']),
  description: z.string().optional().default(''),
});

/**
 * Zod validation schema for Customers / Leads
 */
export const customerSchema = z.object({
  name: z.string().min(2, 'Full name is required (min 2 characters)'),
  phone: z
    .string()
    .min(10, 'Phone must be at least 10 digits')
    .regex(/^[0-9+\s-]{10,15}$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  city: z.string().min(2, 'City is required'),
  budgetMin: z.coerce.number().min(0, 'Min budget must be non-negative'),
  budgetMax: z.coerce.number().min(0, 'Max budget must be non-negative'),
  interestedProjectName: z.string().min(1, 'Please select or enter an interested project'),
  status: z.enum([
    'New',
    'Interested',
    'Site Visit',
    'Negotiation',
    'Booked',
    'Follow-up',
    'Converted',
    'Lost',
  ]),
  nextFollowup: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

/**
 * Zod validation schema for Appointments
 */
export const appointmentSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().min(10, 'Phone number is required'),
  projectName: z.string().min(1, 'Project is required'),
  plotNumber: z.string().optional().default(''),
  type: z.enum([
    'Site Visit',
    'Office Meeting',
    'Document Meeting',
    'Follow-up Call',
    'Registration',
    'Payment',
  ]),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(2, 'Location is required'),
  notes: z.string().optional().default(''),
});

/**
 * Zod validation schema for Login
 */
export const loginSchema = z.object({
  emailOrPhone: z.string().min(3, 'Enter valid email or mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
});
