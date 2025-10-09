import express from "express";
import adminC from "../controllers/admin.controller.js";
const adminRouter = express.Router();
const adminController = new adminC();

adminRouter.post("/addCFProblem", (req, res)=>{
   adminController.addCFProblem(req, res);
})

adminRouter.post("/addLCProblem", (req, res)=>{
   adminController.addCFProblem(req, res);
})

adminRouter.post("/addCFSolution", (req, res)=>{
   adminController.addCFSolution(req, res);
})

adminRouter.post("/addLCSolution", (req, res)=>{
   adminController.addLCSolution(req, res);
})



export default adminRouter;