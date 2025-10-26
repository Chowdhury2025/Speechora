import express from "express";
import { getDashboardStats, getExpensesSummary } from "./controller";

const dashboardRouter = express.Router();

dashboardRouter.get("/stats", getDashboardStats);
dashboardRouter.get("/expenses-summary", getExpensesSummary);

export default dashboardRouter;
