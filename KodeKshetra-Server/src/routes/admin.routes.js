import express from "express";
import adminC from "../controllers/admin.controller.js";
import jwt from "../middlewares/jwt.middleware.js";
const adminRouter = express.Router();
const adminController = new adminC();

adminRouter.post("/addCFProblem", jwt, (req, res) => {
   adminController.addCFProblem(req, res);
})

adminRouter.post("/addLCProblem", jwt, (req, res) => {
   adminController.addLCProblem(req, res);
})

adminRouter.post("/importProblem", jwt, (req, res) => {
   adminController.importProblem(req, res);
})





export default adminRouter;
