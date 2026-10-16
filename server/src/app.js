const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const { issueCsrf, verifyCsrf } = require('./middleware/csrf');
const xss = require('xss-clean');

const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const employerRoutes = require('./routes/employerRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const supportRoutes = require('./routes/supportRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');


const app = express();


// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.CLIENT_URL, process.env.LLM_API_URL],
    },
  },
}));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());
app.use(cookieParser());
app.use(issueCsrf);
app.use('/api', verifyCsrf);
app.use(xss());

// Global rate limit
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Health
app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);

// ─── DIAGNOSTIC — place HERE, after all registrations ───
if (process.env.NODE_ENV !== 'production') {
  console.log('\n──── REGISTERED ROUTES ────');
  const listRoutes = (stack, prefix = '') => {
    stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase()).join(',');
        console.log(`  ${methods.padEnd(8)} ${prefix}${layer.route.path}`);
      } else if (layer.name === 'router' && layer.handle?.stack) {
        const match = layer.regexp.toString().match(/^\/\^\\\/(.*?)\\\/\?/);
        const segment = match ? `/${match[1].replace(/\\\//g, '/')}` : '';
        listRoutes(layer.handle.stack, prefix + segment);
      }
    });
  };
  listRoutes(app._router.stack);
  console.log('───────────────────────────\n');
}


// ─── 404 catch-all (must be LAST) ───
app.all('*', (req, res, next) => next(new AppError(`Route ${req.originalUrl} not found`, 404)));
app.use(errorHandler);

if (process.env.STORAGE_DRIVER !== 's3') {
  app.use('/uploads', require('express').static(require('path').join(process.cwd(), 'uploads')));
}

module.exports = app;