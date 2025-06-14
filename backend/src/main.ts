import "dotenv/config";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import logger from "morgan";
import os from 'os';



import userRouter from "./User/router";
import videoRouter from "./Video/router";
import imageRouter from "./Image/router";
import dashboardRouter from "./Dashboard/router";
import quizRouter from "./Quiz/router";

const app: Express = express();

// Get local IP addresses
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const ipAddresses: string[] = [];
  
  Object.values(interfaces).forEach((iface) => {
    if (iface) {
      iface.forEach((details) => {
        if (details.family === 'IPv4' && !details.internal) {
          ipAddresses.push(details.address);
        }
      });
    }
  });
  
  return ipAddresses;
}

// middleware
const corsOptions: cors.CorsOptions = {
  origin: [
    'http://localhost:5173',  // Local development
    'https://book8-nkn5jbgio-jamadracs-projects.vercel.app',  // Production frontend
    'http://localhost:3000',  // Alternative local port
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Origin',
    'X-Requested-With',
    'Accept'
  ],
  credentials: true,
  optionsSuccessStatus: 200
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
app.use("/api/quiz", quizRouter);

// Add email configuration router



app.get("/", (req: Request, res: Response) => {
  console.log(req.body);
  res.json("book8 latest");
}); 

app.listen(8000, '0.0.0.0', () => {
  const ipAddresses = getLocalIpAddresses();
  console.log(`Server up and running on port 8000`);
  console.log('Server can be accessed at:');
  console.log('- Local: http://localhost:8000');
  ipAddresses.forEach(ip => {
    console.log(`- Network: http://${ip}:8000`);
  });
});
