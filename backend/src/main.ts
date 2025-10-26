import "dotenv/config";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import logger from "morgan";
import os from 'os';



import userRouter from "./User/router";
import videoRouter from "./Video/router";
import imageRouter from "./Image/router";
import dashboardRouter from "./Dashboard/router";
import testRouter from "./Test/router";
import lessonRouter from "./lesson/router";
import quizImageRouter from "./QuizImage/router";
import parentRouter from "./app/Parent/router";  // Add parent router import
import systemSettingsRouter from './SystemSettings/router';
import promoCodeRouter from './app/PromoCode/router';  // Add promo code router import
import presentation3Router from './app/Presentation3/router';  // Add presentation3 router import
import uploadRouter from './Upload/router';  // Add upload router import
import paymentRouter from './Payment/router';  // Add payment router import


const app: Express = express();

// Get local IP addresses
function getLocalIpAddresses(): string[] {
  const interfaces = os.networkInterfaces();
  const ipAddresses: string[] = [];
  
  Object.values(interfaces).forEach((iface) => {
    if (iface) {
      iface.forEach((details: os.NetworkInterfaceInfo) => {
        if (details.family === 'IPv4' && !details.internal) {
          ipAddresses.push(details.address);
        }
      });
    }
  });
  
  return ipAddresses;
}

// middleware
// Allowlist static origins and a local-network pattern for convenience when
// developing from other devices on the LAN (e.g. 192.168.x.x:8800).
const allowedOrigins = [
  "https://speechora.com",
  "http://localhost:5173",
  "http://192.168.43.204:8000",
  "http://localhost:8800",
  "http://192.168.43.204:8800",
];

const localNetworkRegex = /^https?:\/\/192\.168\.(?:\d{1,3})\.(?:\d{1,3}):8800$/;

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || localNetworkRegex.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  credentials: true,
  maxAge: 86400, // Cache preflight request results for 24 hours
};
 
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Increased limit for large backup files
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(logger("dev"));

// Handle preflight requests
app.options('*', cors(corsOptions));  // Handle OPTIONS for all routes

// routes 😂
app.use("/api/user", userRouter);
app.use("/api/videos", videoRouter);
app.use("/api/images", imageRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/tests", testRouter);
app.use("/api/lessons", lessonRouter);
app.use("/api/quiz-images", quizImageRouter);
app.use("/api", parentRouter);  // Add parent routes
app.use('/api/system', systemSettingsRouter); // Premium Pricing uses POST for update
app.use('/api/promo-codes', promoCodeRouter); // Add promo code routes
app.use('/api/presentation3', presentation3Router); // Add presentation3 routes
app.use('/api/upload', uploadRouter); // Add upload routes
app.use('/api/payments', paymentRouter); // Add payment routes

// Add email configuration router

// Version check endpoint
app.get('/api/version', (_req: Request, res: Response) => {
  // You can set this in your .env or hardcode for now
  const version = process.env.APP_VERSION || '1.0.0';
  res.json({ version });
});

app.get("/", (req: Request, res: Response) => {
  console.log(req.body);
  res.json("Speechora latest");
}); 

app.listen(8000, '0.0.0.0', () => {
  const ipAddresses = getLocalIpAddresses();
  console.log(`Server up and running on port 8000`);
  console.log('Server can be accessed at:');
  console.log('- Local: http://localhost:8000');  ipAddresses.forEach(ip => {
    console.log(`- Network: http://${ip}:8000`);
  });
});
