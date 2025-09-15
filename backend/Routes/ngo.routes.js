import express from "express";
import {
    registerNGO,
    updateNGO,
    getNGOById,
    listNGOs,
    updateNGOStaus
} from "../Controllers/ngo.controller.js";

import { authMiddleware, roleMiddleware } from "../Middlewares/auth.middleware.js";

const ngoRouter = express.Router();

ngoRouter.post("/register", authMiddleware, regsiterNGO);
ngoRouter.put("/:id", authMiddleware, updateNGO);
ngoRouter.get("/:id", getNGOById);
ngoRouter.get("/", listNGOs);

ngoRouter.put("/:id/status", authMiddleware, roleMiddleware(["admin"]), updateNGOStaus);

export default ngoRouter;
