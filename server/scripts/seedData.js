/**
 * ShramSetu — Dummy Data Seeder
 * Usage:
 *   npm run seed:data          → add data (keeps existing)
 *   npm run seed:data:clear    → wipe first, then add
 *
 * All users are pre-verified and can log in with ANY OTP in dev mode.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

const User = require('../src/models/User');
const WorkerProfile = require('../src/models/WorkerProfile');
const EmployerProfile = require('../src/models/EmployerProfile');
const Job = require('../src/models/Job');
const JobApplication = require('../src/models/JobApplication');
const WorkAssignment = require('../src/models/WorkAssignment');
const WorkHistory = require('../src/models/WorkHistory');
const Review = require('../src/models/Review');
const Notification = require('../src/models/Notification');
const Conversation = require('../src/models/Conversation');
const Message = require('../src/models/Message');

const CLEAR = process.argv.includes('--clear');

/* ══════════════════════════════════════════════════════════════════
   BANGALORE COORDINATES — realistic neighborhoods
   ══════════════════════════════════════════════════════════════════ */
const AREAS = {
  koramangala:   { lng: 77.6229, lat: 12.9345, label: 'Koramangala, Bengaluru' },
  indiranagar:   { lng: 77.6408, lat: 12.9784, label: 'Indiranagar, Bengaluru' },
  whitefield:    { lng: 77.7499, lat: 12.9698, label: 'Whitefield, Bengaluru' },
  btm:           { lng: 77.6101, lat: 12.9166, label: 'BTM Layout, Bengaluru' },
  hsr:           { lng: 77.6413, lat: 12.9121, label: 'HSR Layout, Bengaluru' },
  jayanagar:     { lng: 77.5835, lat: 12.9250, label: 'Jayanagar, Bengaluru' },
  marathahalli:  { lng: 77.6974, lat: 12.9591, label: 'Marathahalli, Bengaluru' },
  electronic:    { lng: 77.6660, lat: 12.8452, label: 'Electronic City, Bengaluru' },
};

/* ══════════════════════════════════════════════════════════════════
   WORKERS
   ══════════════════════════════════════════════════════════════════ */
const WORKERS = [
  {
    phone: '9000000001',
    fullName: 'Rajan Kumar',
    photoUrl: null,
    bio: 'Experienced delivery rider. Own two-wheeler, know every lane in Koramangala and Indiranagar.',
    skills: ['delivery', 'driver'],
    experienceYears: 5,
    availability: 'morning',
    languages: ['hi', 'en'],
    location: AREAS.koramangala,
    rating: 4.8,
    totalReviews: 12,
    totalJobsCompleted: 47,
    totalEarnings: 28200,
    reliabilityScore: 98,
    aadhaarNumber: '123412341234',
    aadhaarName: 'Rajan Kumar',
    selfieUrl: 'https://i.pravatar.cc/300?img=12',
    idVerified: true,
    upiId: 'rajan@ybl',
  },
  {
    phone: '9000000002',
    fullName: 'Suresh Yadav',
    photoUrl: null,
    bio: 'Certified plumber with 8 years of experience. Emergency repairs available.',
    skills: ['plumber', 'helper'],
    experienceYears: 8,
    availability: 'flexible',
    languages: ['hi'],
    location: AREAS.indiranagar,
    rating: 4.6,
    totalReviews: 22,
    totalJobsCompleted: 58,
    totalEarnings: 46000,
    reliabilityScore: 95,
    aadhaarNumber: '234523452345',
    aadhaarName: 'Suresh Yadav',
    selfieUrl: 'https://i.pravatar.cc/300?img=13',
    idVerified: true,
    upiId: 'suresh@paytm',
  },
  {
    phone: '9000000003',
    fullName: 'Meena Devi',
    photoUrl: null,
    bio: 'Trustworthy domestic helper. Cooking, cleaning, childcare.',
    skills: ['domesticHelp', 'cook'],
    experienceYears: 4,
    availability: 'morning',
    languages: ['hi'],
    location: AREAS.hsr,
    rating: 4.9,
    totalReviews: 18,
    totalJobsCompleted: 31,
    totalEarnings: 15500,
    reliabilityScore: 99,
    aadhaarNumber: '345634563456',
    aadhaarName: 'Meena Devi',
    selfieUrl: 'https://i.pravatar.cc/300?img=5',
    idVerified: true,
    upiId: 'meena@ybl',
  },
  {
    phone: '9000000004',
    fullName: 'Arun Mishra',
    photoUrl: null,
    bio: 'Top-rated delivery rider. 5 years experience with food and grocery delivery.',
    skills: ['delivery', 'driver'],
    experienceYears: 5,
    availability: 'morning',
    languages: ['hi', 'en', 'kn'],
    location: AREAS.koramangala,
    rating: 4.8,
    totalReviews: 30,
    totalJobsCompleted: 94,
    totalEarnings: 56400,
    reliabilityScore: 99,
    aadhaarNumber: '456745674567',
    aadhaarName: 'Arun Mishra',
    selfieUrl: 'https://i.pravatar.cc/300?img=15',
    idVerified: true,
    upiId: 'arun@icici',
  },
  {
    phone: '9000000005',
    fullName: 'Deepa Nair',
    photoUrl: null,
    bio: 'Home cook specialising in South Indian and North Indian dishes.',
    skills: ['cook', 'domesticHelp'],
    experienceYears: 2,
    availability: 'flexible',
    languages: ['en', 'hi'],
    location: AREAS.indiranagar,
    rating: 4.6,
    totalReviews: 9,
    totalJobsCompleted: 43,
    totalEarnings: 17200,
    reliabilityScore: 92,
    aadhaarNumber: '567856785678',
    aadhaarName: 'Deepa Nair',
    selfieUrl: 'https://i.pravatar.cc/300?img=20',
    idVerified: true,
    upiId: 'deepa@ybl',
  },
  {
    phone: '9000000006',
    fullName: 'Sanjay Patil',
    photoUrl: null,
    bio: 'Reliable driver. Own sedan. Available for full-day personal driving.',
    skills: ['driver'],
    experienceYears: 3,
    availability: 'full_day',
    languages: ['hi', 'mr'],
    location: AREAS.btm,
    rating: 4.5,
    totalReviews: 14,
    totalJobsCompleted: 61,
    totalEarnings: 42700,
    reliabilityScore: 96,
    aadhaarNumber: '678967896789',
    aadhaarName: 'Sanjay Patil',
    selfieUrl: 'https://i.pravatar.cc/300?img=25',
    idVerified: true,
    upiId: 'sanjay@ybl',
  },
  {
    phone: '9000000007',
    fullName: 'Kavitha Reddy',
    photoUrl: null,
    bio: 'General helper. Flexible with timings. Good with housework and errands.',
    skills: ['helper', 'domesticHelp'],
    experienceYears: 1,
    availability: 'afternoon',
    languages: ['te', 'hi', 'en'],
    location: AREAS.jayanagar,
    rating: 4.3,
    totalReviews: 6,
    totalJobsCompleted: 22,
    totalEarnings: 8800,
    reliabilityScore: 89,
    idVerified: false, // Not yet verified — good for testing pending state
    upiId: 'kavitha@ybl',
  },
  {
    phone: '9000000008',
    fullName: 'Ram Singh',
    photoUrl: null,
    bio: 'Mason with 12 years experience. Bricklaying, plastering, tiling.',
    skills: ['mason', 'construction'],
    experienceYears: 12,
    availability: 'morning',
    languages: ['hi'],
    location: AREAS.whitefield,
    rating: 4.7,
    totalReviews: 25,
    totalJobsCompleted: 82,
    totalEarnings: 123000,
    reliabilityScore: 97,
    aadhaarNumber: '789078907890',
    aadhaarName: 'Ram Singh',
    selfieUrl: 'https://i.pravatar.cc/300?img=33',
    idVerified: true,
    upiId: 'ram@ybl',
  },
  {
    phone: '9000000009',
    fullName: 'Lakshmi Iyer',
    photoUrl: null,
    bio: 'Professional cook. Specialised in South Indian tiffin and meals.',
    skills: ['cook'],
    experienceYears: 6,
    availability: 'morning',
    languages: ['ta', 'en', 'hi'],
    location: AREAS.marathahalli,
    rating: 4.9,
    totalReviews: 41,
    totalJobsCompleted: 128,
    totalEarnings: 38400,
    reliabilityScore: 99,
    aadhaarNumber: '890189018901',
    aadhaarName: 'Lakshmi Iyer',
    selfieUrl: 'https://i.pravatar.cc/300?img=45',
    idVerified: true,
    upiId: 'lakshmi@icici',
  },
  {
    phone: '9000000010',
    fullName: 'Mohammed Ali',
    photoUrl: null,
    bio: 'Licensed electrician. Wiring, repairs, appliance installation.',
    skills: ['electrician'],
    experienceYears: 7,
    availability: 'flexible',
    languages: ['hi', 'en', 'ur'],
    location: AREAS.electronic,
    rating: 4.6,
    totalReviews: 19,
    totalJobsCompleted: 55,
    totalEarnings: 71500,
    reliabilityScore: 94,
    aadhaarNumber: '901290129012',
    aadhaarName: 'Mohammed Ali',
    selfieUrl: 'https://i.pravatar.cc/300?img=52',
    idVerified: true,
    upiId: 'ali@ybl',
  },
];

/* ══════════════════════════════════════════════════════════════════
   EMPLOYERS
   ══════════════════════════════════════════════════════════════════ */
const EMPLOYERS = [
  {
    phone: '9100000001',
    accountType: 'business',
    businessName: 'QuickMart Grocery',
    businessType: 'grocery',
    ownerName: 'Vikram Sharma',
    email: 'hr@quickmart.in',
    description: 'Fast-growing grocery chain in Bengaluru. Delivering fresh produce across 12 neighborhoods. We hire riders, helpers, warehouse staff monthly.',
    industry: 'Retail',
    yearsInBusiness: 3,
    employeeCount: '21-100',
    hiringCategories: ['delivery', 'driver', 'helper', 'warehouse', 'security'],
    location: AREAS.koramangala,
    address: 'Koramangala 5th Block, Bengaluru',
    serviceRadiusKm: 15,
    rating: 4.7,
    totalReviews: 42,
    jobsPosted: 18,
    workersHired: 27,
    paymentReliability: 98,
    gstNumber: '29ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    businessDocUrl: 'https://via.placeholder.com/600x400?text=GST+Certificate',
    selfieUrl: 'https://i.pravatar.cc/300?img=68',
    businessVerified: true,
    contactPhone: '9100000001',
    showContact: true,
    upiId: 'quickmart@icici',
  },
  {
    phone: '9100000002',
    accountType: 'business',
    businessName: 'Sri Ram Builders',
    businessType: 'construction',
    ownerName: 'Rajesh Kumar',
    email: 'projects@srirambuilders.co.in',
    description: 'Residential and commercial construction projects across Bengaluru. We hire masons, helpers, electricians for multi-week projects.',
    industry: 'Construction',
    yearsInBusiness: 15,
    employeeCount: '100+',
    hiringCategories: ['mason', 'helper', 'construction', 'electrician', 'plumber'],
    location: AREAS.whitefield,
    address: 'Whitefield Main Road, Bengaluru',
    serviceRadiusKm: 25,
    rating: 4.5,
    totalReviews: 33,
    jobsPosted: 24,
    workersHired: 89,
    paymentReliability: 96,
    gstNumber: '29FGHIJ5678K1Z9',
    panNumber: 'FGHIJ5678K',
    businessDocUrl: 'https://via.placeholder.com/600x400?text=Business+License',
    selfieUrl: 'https://i.pravatar.cc/300?img=51',
    businessVerified: true,
    contactPhone: '9100000002',
    showContact: true,
    upiId: 'sriram@hdfc',
  },
  {
    phone: '9100000003',
    accountType: 'business',
    businessName: 'HomeShine Services',
    businessType: 'services',
    ownerName: 'Anjali Mehta',
    email: 'ops@homeshine.in',
    description: 'Home cleaning, plumbing and electrical services for families across Bengaluru. We hire verified professionals for same-day service.',
    industry: 'Home Services',
    yearsInBusiness: 5,
    employeeCount: '21-100',
    hiringCategories: ['domesticHelp', 'plumber', 'electrician', 'helper'],
    location: AREAS.indiranagar,
    address: 'Indiranagar 100ft Road, Bengaluru',
    serviceRadiusKm: 12,
    rating: 4.8,
    totalReviews: 56,
    jobsPosted: 41,
    workersHired: 62,
    paymentReliability: 99,
    gstNumber: '29KLMNO9012P1Z3',
    panNumber: 'KLMNO9012P',
    businessDocUrl: 'https://via.placeholder.com/600x400?text=GST+Certificate',
    selfieUrl: 'https://i.pravatar.cc/300?img=48',
    businessVerified: true,
    contactPhone: '9100000003',
    showContact: true,
    upiId: 'homeshine@icici',
  },
  {
    phone: '9100000004',
    accountType: 'business',
    businessName: 'Cafe Coffee Day — HQ',
    businessType: 'restaurant',
    ownerName: 'Suresh Menon',
    email: 'careers@ccd.in',
    description: 'India\'s largest coffee chain. Hiring baristas, cooks, cleaning staff across Bengaluru outlets.',
    industry: 'Food & Beverage',
    yearsInBusiness: 20,
    employeeCount: '100+',
    hiringCategories: ['cook', 'helper', 'delivery', 'domesticHelp'],
    location: AREAS.marathahalli,
    address: 'Marathahalli Outer Ring Road, Bengaluru',
    serviceRadiusKm: 20,
    rating: 4.6,
    totalReviews: 78,
    jobsPosted: 52,
    workersHired: 141,
    paymentReliability: 97,
    gstNumber: '29PQRST3456U1Z7',
    panNumber: 'PQRST3456U',
    businessDocUrl: 'https://via.placeholder.com/600x400?text=Business+License',
    selfieUrl: 'https://i.pravatar.cc/300?img=60',
    businessVerified: true,
    contactPhone: '9100000004',
    showContact: true,
    upiId: 'ccd@hdfc',
  },
  /* ── Individual employers ── */
  {
    phone: '9100000005',
    accountType: 'individual',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    hireReason: 'Looking for a cook for my family of 4. Need someone who can prepare North Indian meals twice a day, Monday to Saturday. Veg + non-veg preferred.',
    householdSize: '2-4',
    idType: 'aadhaar',
    idNumber: '112233445566',
    idDocUrl: 'https://via.placeholder.com/600x400?text=Aadhaar',
    selfieUrl: 'https://i.pravatar.cc/300?img=9',
    hiringCategories: ['cook', 'domesticHelp'],
    location: AREAS.hsr,
    address: 'HSR Layout Sector 2, Bengaluru',
    serviceRadiusKm: 5,
    rating: 4.9,
    totalReviews: 4,
    jobsPosted: 2,
    workersHired: 3,
    paymentReliability: 100,
    businessVerified: true,
    contactPhone: '9100000005',
    showContact: true,
    upiId: 'priya@ybl',
  },
  {
    phone: '9100000006',
    accountType: 'individual',
    fullName: 'Amit Verma',
    email: 'amit.verma@outlook.com',
    hireReason: 'Need a personal driver for office commute and weekend errands. Prefer someone with 3+ years experience and clean driving record.',
    householdSize: '2-4',
    idType: 'dl',
    idNumber: 'KA0120180001234',
    idDocUrl: 'https://via.placeholder.com/600x400?text=Driving+License',
    selfieUrl: 'https://i.pravatar.cc/300?img=14',
    hiringCategories: ['driver'],
    location: AREAS.btm,
    address: 'BTM Layout 2nd Stage, Bengaluru',
    serviceRadiusKm: 10,
    rating: 4.7,
    totalReviews: 2,
    jobsPosted: 1,
    workersHired: 1,
    paymentReliability: 100,
    businessVerified: true,
    contactPhone: '9100000006',
    showContact: true,
    upiId: 'amit@ybl',
  },
  {
    phone: '9100000007',
    accountType: 'individual',
    fullName: 'Rekha Iyer',
    email: 'rekha.iyer@gmail.com',
    hireReason: 'Senior citizen, looking for a part-time helper for household chores and errands. 2-3 hours daily in the morning.',
    householdSize: '1',
    idType: 'aadhaar',
    idNumber: '998877665544',
    // Note: no selfie, no doc — so she stays "pending" for testing
    hiringCategories: ['helper', 'domesticHelp'],
    location: AREAS.jayanagar,
    address: 'Jayanagar 4th Block, Bengaluru',
    serviceRadiusKm: 3,
    rating: 0,
    totalReviews: 0,
    jobsPosted: 1,
    workersHired: 0,
    paymentReliability: 100,
    businessVerified: false,
    contactPhone: '9100000007',
    showContact: false, // Hidden — good for testing privacy toggle
  },
];

/* ══════════════════════════════════════════════════════════════════
   JOBS
   ══════════════════════════════════════════════════════════════════ */
const JOBS = [
  // QuickMart jobs
  {
    employerPhone: '9100000001',
    title: 'Delivery Rider — Morning Shift',
    category: 'Delivery',
    description: 'Deliver groceries on your own two-wheeler. Fuel allowance included. Morning or evening shift available. Deliver within 5 km radius of Koramangala.',
    requiredSkills: ['Two-wheeler', 'Driving license', 'GPS'],
    travelRadiusKm: 5,
    schedule: { shift: 'morning', workingDays: 'Mon-Sat', startDate: daysFromNow(1) },
    payRate: 600, payType: 'day', workersNeeded: 5, minExperienceYears: 1,
    location: AREAS.koramangala,
    status: 'POSTED',
  },
  {
    employerPhone: '9100000001',
    title: 'Warehouse Associate',
    category: 'Warehouse',
    description: 'Loading, unloading, and packing groceries in our warehouse. Physical work — must be able to lift 20 kg. Weekly pay.',
    requiredSkills: ['Physical strength'],
    travelRadiusKm: 8,
    schedule: { shift: 'full_day', workingDays: 'Mon-Sat', startDate: daysFromNow(2) },
    payRate: 700, payType: 'day', workersNeeded: 3, minExperienceYears: 0,
    location: AREAS.koramangala,
    status: 'POSTED',
  },
  {
    employerPhone: '9100000001',
    title: 'Night Shift Security Guard',
    category: 'Security Guard',
    description: 'Night shift security for our warehouse. Basic English reading required for logging.',
    requiredSkills: [],
    travelRadiusKm: 10,
    schedule: { shift: 'night', workingDays: 'All 7 days', startDate: daysFromNow(3) },
    payRate: 800, payType: 'day', workersNeeded: 2, minExperienceYears: 1,
    location: AREAS.koramangala,
    status: 'POSTED',
  },
  // Sri Ram Builders jobs
  {
    employerPhone: '9100000002',
    title: 'Construction Helper — 3 Month Contract',
    category: 'Construction',
    description: 'Loading, unloading, and basic construction work. 3-month contract with weekly pay. Site is at Whitefield. Meals provided.',
    requiredSkills: ['Physical strength'],
    travelRadiusKm: 15,
    schedule: { shift: 'morning', workingDays: 'Mon-Sat', startDate: daysFromNow(1) },
    payRate: 700, payType: 'day', workersNeeded: 10, minExperienceYears: 0,
    location: AREAS.whitefield,
    status: 'POSTED',
  },
  {
    employerPhone: '9100000002',
    title: 'Experienced Mason',
    category: 'Construction',
    description: 'Looking for skilled masons for a residential building project. Bricklaying, plastering, tiling. Long-term work available.',
    requiredSkills: ['Physical strength'],
    travelRadiusKm: 20,
    schedule: { shift: 'morning', workingDays: 'Mon-Sat', startDate: daysFromNow(2) },
    payRate: 1100, payType: 'day', workersNeeded: 4, minExperienceYears: 3,
    location: AREAS.whitefield,
    status: 'POSTED',
  },
  // HomeShine jobs
  {
    employerPhone: '9100000003',
    title: 'House Cleaning Staff',
    category: 'Domestic Help',
    description: 'Daily household cleaning, vessels, and mopping. 5 days/week. Customer locations in Indiranagar and Domlur.',
    requiredSkills: [],
    travelRadiusKm: 8,
    schedule: { shift: 'morning', workingDays: 'Mon-Fri', startDate: daysFromNow(1) },
    payRate: 400, payType: 'day', workersNeeded: 6, minExperienceYears: 0,
    location: AREAS.indiranagar,
    status: 'POSTED',
  },
  {
    employerPhone: '9100000003',
    title: 'Emergency Plumber',
    category: 'Plumber',
    description: 'On-call plumber for same-day service calls. Leaking taps, blocked drains, bathroom fittings. Own tools required.',
    requiredSkills: ['Own tools'],
    travelRadiusKm: 12,
    schedule: { shift: 'flexible', workingDays: 'As needed', startDate: daysFromNow(1) },
    payRate: 900, payType: 'job', workersNeeded: 3, minExperienceYears: 2,
    location: AREAS.indiranagar,
    status: 'POSTED',
  },
  {
    employerPhone: '9100000003',
    title: 'Electrician — Appliance Repair',
    category: 'Electrician',
    description: 'Fix fans, geysers, and small appliances at customer homes. Own multimeter and basic tools required.',
    requiredSkills: ['Own tools'],
    travelRadiusKm: 12,
    schedule: { shift: 'flexible', workingDays: 'As needed', startDate: daysFromNow(2) },
    payRate: 850, payType: 'job', workersNeeded: 2, minExperienceYears: 2,
    location: AREAS.indiranagar,
    status: 'POSTED',
  },
  // CCD jobs
  {
    employerPhone: '9100000004',
    title: 'Cook — Continental',
    category: 'Cook',
    description: 'Prepare continental breakfast and lunch items for our cafe. 6-day week. Experience in a commercial kitchen preferred.',
    requiredSkills: ['Physical strength'],
    travelRadiusKm: 15,
    schedule: { shift: 'morning', workingDays: 'Mon-Sat', startDate: daysFromNow(5) },
    payRate: 25000, payType: 'month', workersNeeded: 2, minExperienceYears: 2,
    location: AREAS.marathahalli,
    status: 'POSTED',
  },
  {
    employerPhone: '9100000004',
    title: 'Barista Trainee',
    category: 'Cook',
    description: 'Learn to make coffee the CCD way. Full training provided. Excellent communication skills needed.',
    requiredSkills: ['Customer service'],
    travelRadiusKm: 10,
    schedule: { shift: 'afternoon', workingDays: 'Mon-Sat', startDate: daysFromNow(7) },
    payRate: 18000, payType: 'month', workersNeeded: 4, minExperienceYears: 0,
    location: AREAS.marathahalli,
    status: 'POSTED',
  },
  // Individual employers
  {
    employerPhone: '9100000005',
    title: 'Cook for Family (Part-time)',
    category: 'Cook',
    description: 'Prepare lunch and dinner for a family of 4. North Indian vegetarian meals. 2 hours morning + 1 hour evening.',
    requiredSkills: [],
    travelRadiusKm: 3,
    schedule: { shift: 'morning', workingDays: 'Mon-Sat', startDate: daysFromNow(1) },
    payRate: 15000, payType: 'month', workersNeeded: 1, minExperienceYears: 1,
    location: AREAS.hsr,
    status: 'POSTED',
  },
  {
    employerPhone: '9100000006',
    title: 'Personal Driver — Full Time',
    category: 'Driver',
    description: 'Office commute (9-7) Monday to Saturday. Weekend errands occasionally. Own license required.',
    requiredSkills: ['Driving license'],
    travelRadiusKm: 8,
    schedule: { shift: 'full_day', workingDays: 'Mon-Sat', startDate: daysFromNow(3) },
    payRate: 22000, payType: 'month', workersNeeded: 1, minExperienceYears: 3,
    location: AREAS.btm,
    status: 'POSTED',
  },
  {
    employerPhone: '9100000007',
    title: 'Part-time Helper for Senior',
    category: 'Helper',
    description: 'Help with household chores, grocery runs and errands. 2-3 hours daily morning. Female helper preferred.',
    requiredSkills: [],
    travelRadiusKm: 3,
    schedule: { shift: 'morning', workingDays: 'Mon-Sat', startDate: daysFromNow(2) },
    payRate: 8000, payType: 'month', workersNeeded: 1, minExperienceYears: 0,
    location: AREAS.jayanagar,
    status: 'POSTED',
  },
];

/* ══════════════════════════════════════════════════════════════════
   APPLICATIONS + ASSIGNMENTS + REVIEWS
   ══════════════════════════════════════════════════════════════════ */
const APPLICATIONS = [
  // Delivery rider — QuickMart (many applicants, varied statuses)
  { jobTitle: 'Delivery Rider — Morning Shift', workerPhone: '9000000004', status: 'HIRED',            matchScore: 96, coverNote: 'Available from tomorrow' },
  { jobTitle: 'Delivery Rider — Morning Shift', workerPhone: '9000000001', status: 'SHORTLISTED',      matchScore: 93, coverNote: 'Own bike + GPS' },
  { jobTitle: 'Delivery Rider — Morning Shift', workerPhone: '9000000006', status: 'APPLIED',          matchScore: 76 },
  { jobTitle: 'Delivery Rider — Morning Shift', workerPhone: '9000000007', status: 'REJECTED',         matchScore: 62 },

  // Warehouse — QuickMart
  { jobTitle: 'Warehouse Associate', workerPhone: '9000000007', status: 'APPLIED', matchScore: 71 },
  { jobTitle: 'Warehouse Associate', workerPhone: '9000000008', status: 'APPLIED', matchScore: 68 },

  // Construction Helper — Sri Ram
  { jobTitle: 'Construction Helper — 3 Month Contract', workerPhone: '9000000008', status: 'HIRED',    matchScore: 88 },
  { jobTitle: 'Construction Helper — 3 Month Contract', workerPhone: '9000000007', status: 'APPLIED',  matchScore: 74 },
  { jobTitle: 'Construction Helper — 3 Month Contract', workerPhone: '9000000001', status: 'APPLIED',  matchScore: 55 },

  // House Cleaning — HomeShine
  { jobTitle: 'House Cleaning Staff', workerPhone: '9000000003', status: 'HIRED',        matchScore: 94 },
  { jobTitle: 'House Cleaning Staff', workerPhone: '9000000005', status: 'SHORTLISTED',  matchScore: 88 },
  { jobTitle: 'House Cleaning Staff', workerPhone: '9000000007', status: 'APPLIED',      matchScore: 79 },
  { jobTitle: 'House Cleaning Staff', workerPhone: '9000000002', status: 'APPLIED',      matchScore: 45 },

  // Plumber — HomeShine
  { jobTitle: 'Emergency Plumber', workerPhone: '9000000002', status: 'HIRED',      matchScore: 97 },
  { jobTitle: 'Emergency Plumber', workerPhone: '9000000010', status: 'APPLIED',    matchScore: 62 },

  // Electrician — HomeShine
  { jobTitle: 'Electrician — Appliance Repair', workerPhone: '9000000010', status: 'SHORTLISTED', matchScore: 91 },

  // Cook for family — Priya
  { jobTitle: 'Cook for Family (Part-time)', workerPhone: '9000000009', status: 'HIRED',       matchScore: 96 },
  { jobTitle: 'Cook for Family (Part-time)', workerPhone: '9000000005', status: 'SHORTLISTED', matchScore: 88 },
  { jobTitle: 'Cook for Family (Part-time)', workerPhone: '9000000003', status: 'APPLIED',     matchScore: 82 },

  // Driver — Amit
  { jobTitle: 'Personal Driver — Full Time', workerPhone: '9000000006', status: 'HIRED',   matchScore: 91 },

  // Helper — Rekha
  { jobTitle: 'Part-time Helper for Senior', workerPhone: '9000000007', status: 'APPLIED', matchScore: 84 },
  { jobTitle: 'Part-time Helper for Senior', workerPhone: '9000000003', status: 'APPLIED', matchScore: 81 },
];

/* ══════════════════════════════════════════════════════════════════
   REVIEWS — from completed assignments
   ══════════════════════════════════════════════════════════════════ */
const REVIEWS = [
  { jobTitle: 'Delivery Rider — Morning Shift', byPhone: '9100000001', aboutPhone: '9000000004', rating: 5, feedback: 'Excellent rider. Always on time, never missed a delivery. Will hire again.' },
  { jobTitle: 'Delivery Rider — Morning Shift', byPhone: '9000000004', aboutPhone: '9100000001', rating: 5, feedback: 'Good employer. Paid on time, clear instructions.' },
  { jobTitle: 'House Cleaning Staff', byPhone: '9100000003', aboutPhone: '9000000003', rating: 5, feedback: 'Meena is wonderful with clients. Very thorough.' },
  { jobTitle: 'Emergency Plumber', byPhone: '9100000003', aboutPhone: '9000000002', rating: 5, feedback: 'Suresh fixed a leak in 20 minutes. Professional.' },
  { jobTitle: 'Cook for Family (Part-time)', byPhone: '9100000005', aboutPhone: '9000000009', rating: 5, feedback: 'Lakshmi\'s food is excellent. My family loves it.' },
  { jobTitle: 'Personal Driver — Full Time', byPhone: '9100000006', aboutPhone: '9000000006', rating: 4, feedback: 'Reliable driver. Sometimes late in the morning.' },
  { jobTitle: 'Construction Helper — 3 Month Contract', byPhone: '9100000002', aboutPhone: '9000000008', rating: 5, feedback: 'Ram is a skilled mason and helped with helper duties too.' },
];

/* ══════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════ */
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function getOrCreateUser(phone, role) {
  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({
      phone,
      role,
      language: 'hi',
      isVerified: true,
      verificationStatus: 'verified',
    });
  }
  return user;
}

/* ══════════════════════════════════════════════════════════════════
   MAIN SEED
   ══════════════════════════════════════════════════════════════════ */
async function seed() {
  await connectDB();

  if (CLEAR) {
    console.log('🧹 Clearing existing seed data…');
    const seedPhones = [
      ...WORKERS.map((w) => w.phone),
      ...EMPLOYERS.map((e) => e.phone),
    ];
    const seedUsers = await User.find({ phone: { $in: seedPhones } });
    const userIds = seedUsers.map((u) => u._id);

    // Clear dependent data
    const workerProfiles = await WorkerProfile.find({ user: { $in: userIds } });
    const employerProfiles = await EmployerProfile.find({ user: { $in: userIds } });
    const workerIds = workerProfiles.map((w) => w._id);
    const employerIds = employerProfiles.map((e) => e._id);

    await JobApplication.deleteMany({ worker: { $in: workerIds } });
    await Job.deleteMany({ employer: { $in: employerIds } });
    await WorkAssignment.deleteMany({ worker: { $in: workerIds } });
    await WorkHistory.deleteMany({ worker: { $in: workerIds } });
    await Review.deleteMany({ revieweeUser: { $in: userIds } });
    await Review.deleteMany({ reviewer: { $in: userIds } });
    await Notification.deleteMany({ user: { $in: userIds } });
    await Conversation.deleteMany({ participants: { $in: userIds } });
    await WorkerProfile.deleteMany({ _id: { $in: workerIds } });
    await EmployerProfile.deleteMany({ _id: { $in: employerIds } });
    await User.deleteMany({ _id: { $in: userIds } });
    console.log('   ✓ cleared');
  }

  /* ── Workers ── */
  console.log('\n👷 Creating workers…');
  const workerMap = {}; // phone -> {user, profile}
  for (const w of WORKERS) {
    const user = await getOrCreateUser(w.phone, 'worker');
    let profile = await WorkerProfile.findOne({ user: user._id });

    const profileData = {
      user: user._id,
      fullName: w.fullName,
      photoUrl: w.photoUrl || w.selfieUrl,
      bio: w.bio,
      skills: w.skills,
      experienceYears: w.experienceYears,
      availability: w.availability,
      languages: w.languages,
      location: { type: 'Point', coordinates: [w.location.lng, w.location.lat] },
      address: w.location.label,
      rating: w.rating,
      totalReviews: w.totalReviews,
      totalJobsCompleted: w.totalJobsCompleted,
      totalEarnings: w.totalEarnings,
      reliabilityScore: w.reliabilityScore,
      aadhaarNumber: w.aadhaarNumber,
      aadhaarName: w.aadhaarName,
      selfieUrl: w.selfieUrl,
      idDocUrl: w.aadhaarNumber ? `https://via.placeholder.com/600x400?text=Aadhaar+${w.aadhaarNumber.slice(-4)}` : null,
      upiId: w.upiId,
      verification: { idVerified: !!w.idVerified },
    };

    if (profile) {
      Object.assign(profile, profileData);
      await profile.save();
    } else {
      profile = await WorkerProfile.create(profileData);
    }
    workerMap[w.phone] = { user, profile };
    console.log(`   ✓ ${w.fullName.padEnd(20)} ${w.phone}`);
  }

  /* ── Employers ── */
  console.log('\n🏢 Creating employers…');
  const employerMap = {};
  for (const e of EMPLOYERS) {
    const user = await getOrCreateUser(e.phone, 'employer');
    let profile = await EmployerProfile.findOne({ user: user._id });

    const profileData = {
      user: user._id,
      accountType: e.accountType,
      email: e.email,
      photoUrl: e.selfieUrl,
      selfieUrl: e.selfieUrl,
      address: e.address,
      location: { type: 'Point', coordinates: [e.location.lng, e.location.lat] },
      serviceRadiusKm: e.serviceRadiusKm,
      rating: e.rating || 0,
      totalReviews: e.totalReviews || 0,
      jobsPosted: e.jobsPosted || 0,
      workersHired: e.workersHired || 0,
      paymentReliability: e.paymentReliability || 100,
      hiringCategories: e.hiringCategories || [],
      contactPhone: e.contactPhone || '',
      showContact: e.showContact !== false,
      upiId: e.upiId,
      verification: { businessVerified: !!e.businessVerified, documentUrl: e.businessDocUrl },
    };

    if (e.accountType === 'business') {
      Object.assign(profileData, {
        businessName: e.businessName,
        businessType: e.businessType,
        ownerName: e.ownerName,
        description: e.description,
        industry: e.industry,
        yearsInBusiness: e.yearsInBusiness,
        employeeCount: e.employeeCount,
        gstNumber: e.gstNumber,
        panNumber: e.panNumber,
        businessDocUrl: e.businessDocUrl,
      });
    } else {
      Object.assign(profileData, {
        fullName: e.fullName,
        hireReason: e.hireReason,
        householdSize: e.householdSize,
        idType: e.idType,
        idNumber: e.idNumber,
        idDocUrl: e.idDocUrl,
        description: e.hireReason,
      });
    }

    if (profile) {
      Object.assign(profile, profileData);
      await profile.save();
    } else {
      profile = await EmployerProfile.create(profileData);
    }
    employerMap[e.phone] = { user, profile };
    const display = e.accountType === 'business' ? e.businessName : e.fullName;
    console.log(`   ✓ ${display.padEnd(20)} (${e.accountType}) ${e.phone}`);
  }

  /* ── Jobs ── */
  console.log('\n💼 Creating jobs…');
  const jobMap = {}; // title -> job
  for (const j of JOBS) {
    const employer = employerMap[j.employerPhone];
    if (!employer) { console.warn(`   ✗ no employer for ${j.employerPhone}`); continue; }

    let job = await Job.findOne({ employer: employer.profile._id, title: j.title });
    const data = {
      employer: employer.profile._id,
      title: j.title,
      category: j.category,
      description: j.description,
      requiredSkills: j.requiredSkills || [],
      location: { type: 'Point', coordinates: [j.location.lng, j.location.lat] },
      address: j.location.label,
      travelRadiusKm: j.travelRadiusKm || 5,
      schedule: j.schedule,
      payRate: j.payRate,
      payType: j.payType,
      workersNeeded: j.workersNeeded || 1,
      minExperienceYears: j.minExperienceYears || 0,
      status: j.status || 'POSTED',
    };

    if (job) {
      Object.assign(job, data);
      await job.save();
    } else {
      job = await Job.create(data);
    }
    jobMap[j.title] = job;
    console.log(`   ✓ ${j.title.padEnd(45)} ₹${j.payRate}/${j.payType}`);
  }

  /* ── Applications ── */
  console.log('\n📝 Creating applications…');
  let appCount = 0;
  for (const a of APPLICATIONS) {
    const job = jobMap[a.jobTitle];
    const worker = workerMap[a.workerPhone];
    if (!job || !worker) {
      console.warn(`   ✗ missing job or worker for ${a.jobTitle} / ${a.workerPhone}`);
      continue;
    }

    const existing = await JobApplication.findOne({ job: job._id, worker: worker.profile._id });
    const data = {
      job: job._id,
      worker: worker.profile._id,
      status: a.status,
      matchScore: a.matchScore,
      coverNote: a.coverNote || '',
    };

    if (existing) {
      Object.assign(existing, data);
      await existing.save();
    } else {
      await JobApplication.create(data);
    }
    appCount++;
    console.log(`   ✓ ${a.workerPhone} → ${a.jobTitle.padEnd(40)} [${a.status}]`);
  }

  /* ── Assignments (for HIRED applications) ── */
  console.log('\n🤝 Creating work assignments…');
  const hiredApps = await JobApplication.find({ status: 'HIRED' })
    .populate('job')
    .populate('worker')
    .populate('job.employer');
  for (const app of hiredApps) {
    if (!app.job || !app.worker) continue;
    const job = app.job;

    const existing = await WorkAssignment.findOne({ job: job._id, worker: app.worker._id });
    if (existing) continue;

    // 80% of assignments are completed, 20% in progress
    const isCompleted = Math.random() < 0.8;
    const startDate = daysFromNow(-7);
    const endDate = isCompleted ? daysFromNow(-1) : null;

    const assignment = await WorkAssignment.create({
      job: job._id,
      worker: app.worker._id,
      employer: job.employer._id || job.employer,
      application: app._id,
      startDate,
      endDate,
      status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
      completedAt: endDate,
    });
    console.log(`   ✓ ${assignment._id} — ${isCompleted ? 'COMPLETED' : 'IN_PROGRESS'}`);

    // Create WorkHistory for completed assignments
    if (isCompleted) {
      await WorkHistory.create({
        worker: app.worker._id,
        employer: job.employer._id || job.employer,
        job: job._id,
        assignment: assignment._id,
        skill: job.category,
        category: job.category,
        location: job.address,
        startDate,
        endDate,
        durationDays: Math.ceil((endDate - startDate) / 86400000),
        paymentAmount: job.payRate,
        paymentStatus: 'PAID',
        completionStatus: 'COMPLETED',
      });
    }
  }

  /* ── Reviews ── */
  console.log('\n⭐ Creating reviews…');
  let reviewCount = 0;
  for (const r of REVIEWS) {
    const job = jobMap[r.jobTitle];
    const reviewer = workerMap[r.byPhone] || employerMap[r.byPhone];
    const reviewee = workerMap[r.aboutPhone] || employerMap[r.aboutPhone];
    if (!job || !reviewer || !reviewee) continue;

    // Find the assignment
    const assignment = await WorkAssignment.findOne({ job: job._id }).populate('worker');
    if (!assignment) continue;

    // Check if this reviewer already reviewed
    const existing = await Review.findOne({
      assignment: assignment._id,
      reviewer: reviewer.user._id,
    });
    if (existing) continue;

    const reviewerRole = workerMap[r.byPhone] ? 'worker' : 'employer';
    const data = {
      assignment: assignment._id,
      reviewer: reviewer.user._id,
      reviewerRole,
      revieweeUser: reviewee.user._id,
      rating: r.rating,
      feedback: r.feedback,
    };

    if (reviewerRole === 'worker') {
      // Worker reviewing employer
      data.revieweeEmployer = reviewee.profile._id;
    } else {
      // Employer reviewing worker
      data.revieweeWorker = reviewee.profile._id;
    }

    await Review.create(data);
    reviewCount++;
  }
  console.log(`   ✓ ${reviewCount} reviews created`);

  /* ── Summary ── */
  console.log('\n' + '━'.repeat(60));
  console.log('✅ SEED COMPLETE');
  console.log('━'.repeat(60));
  console.log(`   Workers:      ${WORKERS.length}`);
  console.log(`   Employers:    ${EMPLOYERS.length}`);
  console.log(`   Jobs:         ${JOBS.length}`);
  console.log(`   Applications: ${appCount}`);
  console.log(`   Reviews:      ${reviewCount}`);
  console.log('━'.repeat(60));
  console.log('\n📱 Test login (any OTP works in dev):\n');
  console.log('   Workers:');
  WORKERS.slice(0, 3).forEach((w) =>
    console.log(`     ${w.phone}  →  ${w.fullName}`)
  );
  console.log('\n   Employers:');
  EMPLOYERS.slice(0, 3).forEach((e) => {
    const name = e.accountType === 'business' ? e.businessName : e.fullName;
    console.log(`     ${e.phone}  →  ${name} (${e.accountType})`);
  });
  console.log('\n   Admin:    run `npm run seed:admin <your-phone>` to create');
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err);
  process.exit(1);
});