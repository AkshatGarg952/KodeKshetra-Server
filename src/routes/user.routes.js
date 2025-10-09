import express from "express";
import userC from "../controllers/user.controller.js";
import jwt from "../middlewares/jwt.middleware.js";
import {upload} from "../middlewares/storage.middleware.js";
const userRouter = express.Router();
const userController = new userC();

userRouter.post("/register", upload.single('ProfilePicture'), (req, res)=>{
   userController.register(req, res);
})

userRouter.post("/login", (req, res)=>{
   userController.login(req, res);
})

userRouter.put("/update/:id", upload.single('ProfilePicture'), (req, res)=>{
   userController.update(req, res);
})

userRouter.get("/getUserDetails/:userId", (req, res)=>{
   userController.getUserDetails(req, res);
})

userRouter.get("/logout", jwt, (req, res)=>{
   userController.logout(req, res);
})


export default userRouter;