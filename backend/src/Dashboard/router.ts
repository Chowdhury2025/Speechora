import express from "express";
import { getDashboardStats } from "./controller";

const dashboardRouter = express.Router();

dashboardRouter.get("/stats", getDashboardStats);

export default dashboardRouter;
