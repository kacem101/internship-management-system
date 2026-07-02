import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name is too long')
    .regex(/^[A-Za-zÀ-ÿ '-]+$/, 'First name contains invalid characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name is too long')
    .regex(/^[A-Za-zÀ-ÿ '-]+$/, 'Last name contains invalid characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['STUDENT', 'SUPERVISOR']),
  // Student fields
  matricule: z.string().optional(),
  department: z.string().optional(),
  yearOfStudy: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(1, 'Year must be between 1 and 5').max(5, 'Year must be between 1 and 5').optional()
  ),
  phoneNumber: z.string().optional(),
  // Supervisor fields
  specialization: z.string().optional(),
  officeNumber: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).superRefine((d, ctx) => {
  if (d.role === 'STUDENT') {
    if (!d.matricule || d.matricule.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Matricule is required for students', path: ['matricule'] });
    }
    if (!d.department || d.department.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Department is required for students', path: ['department'] });
    }
    if (!d.yearOfStudy) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Year of study is required for students', path: ['yearOfStudy'] });
    }
  }
  if (d.role === 'SUPERVISOR') {
    if (!d.specialization || d.specialization.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Specialization is required for supervisors', path: ['specialization'] });
    }
  }
});

export const offerSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .min(50, 'Description must be at least 50 characters'),
  companyName: z.string()
    .min(1, 'Company name is required')
    .min(2, 'Company name must be at least 2 characters'),
  companyLocation: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  durationWeeks: z.coerce.number({ invalid_type_error: 'Duration must be a number' }).min(1, 'Duration must be at least 1 week'),
  requiredSkills: z.string().optional(),
  reportDeadlineDays: z.coerce.number({ invalid_type_error: 'Must be a number' }).min(1, 'Deadline must be at least 1 day').default(14),
}).refine((d) => {
  if (!d.startDate || !d.endDate) return true;
  return new Date(d.endDate) > new Date(d.startDate);
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const applicationSchema = z.object({
  coverLetter: z.string()
    .min(1, 'Cover letter is required')
    .min(100, 'Cover letter must be at least 100 characters'),
});

export const evaluationSchema = z.object({
  grade: z.coerce.number({ invalid_type_error: 'Grade must be a number' })
    .min(0, 'Grade cannot be less than 0')
    .max(20, 'Grade cannot exceed 20'),
  technicalFeedback: z.string()
    .min(1, 'Technical feedback is required')
    .min(10, 'Technical feedback must be at least 10 characters'),
  professionalFeedback: z.string().optional(),
  generalComments: z.string().optional(),
  companyFeedback: z.string().optional(),
});

export type LoginForm       = z.infer<typeof loginSchema>;
export type RegisterForm    = z.infer<typeof registerSchema>;
export type OfferForm       = z.infer<typeof offerSchema>;
export type ApplicationForm = z.infer<typeof applicationSchema>;
export type EvaluationForm  = z.infer<typeof evaluationSchema>;