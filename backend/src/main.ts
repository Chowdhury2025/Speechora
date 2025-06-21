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
const corsOptions: cors.CorsOptions = {
  origin: [
    "https://book8.vercel.app", 
    "http://localhost:5173",
    "http://192.168.0.101:8800",
    "http://localhost:8800"  // Add your current development port
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
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

// Add email configuration router



app.get("/", (req: Request, res: Response) => {
  console.log(req.body);
  res.json("book8 latest");
}); 

app.listen(8000, '0.0.0.0', () => {
  const ipAddresses = getLocalIpAddresses();
  console.log(`Server up and running on port 8000`);
  console.log('Server can be accessed at:');
  console.log('- Local: http://localhost:8000');  ipAddresses.forEach(ip => {
    console.log(`- Network: http://${ip}:8000`);
  });
});
