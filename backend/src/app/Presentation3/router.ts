import { Router } from "express";
import {
  createPresentation3Item,
  getAllPresentation3Items,
  getPresentation3ItemById,
  updatePresentation3Item,
  deletePresentation3Item,
} from "./controller";

const router = Router();

router.post("/", createPresentation3Item);
router.get("/", getAllPresentation3Items);
router.get("/:id", getPresentation3ItemById);
router.put("/:id", updatePresentation3Item);
router.delete("/:id", deletePresentation3Item);

export default router;
