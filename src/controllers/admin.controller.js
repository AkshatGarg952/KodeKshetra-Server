import CFproblems from "../models/codeforces_questions.model.js";
import leetcodeQuestion from "../models/leetcode_questions.model.js";
import CFsolutions from "../models/codeforces_solutions.model.js";
import LeetCodeSolution from "../models/leetcode_solutions.model.js";
import bcrypt from 'bcrypt'
import User from "../models/user.model.js"


export default class adminC{
    async addCFProblem(req, res){
     const {email, password, problem} = req.body;
        if(email!==process.env.ADMIN_EMAI){
            return res.status(403).send("Access Denied");
        }
        const admin = await User.findOne({email});
        if(!admin){
            return res.status(400).send("Admin not found");
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if(!isMatch){
            return res.status(400).send("Invalid Credentials");
        }

        try{
         problem.source = "codeforces";
         await CFproblems.create(problem);
         res.status(200).send("Problem added successfully");
        }
        catch(err){
            res.status(400).send(err.message);
        }

        
    }

    async addLCProblem(req, res){
    const {email, password, problem} = req.body;
    if(email!==process.env.ADMIN_EMAI){
            return res.status(403).send("Access Denied");
        }
        const admin = await User.findOne({email});
        if(!admin){
            return res.status(400).send("Admin not found");
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if(!isMatch){
            return res.status(400).send("Invalid Credentials");
        }
        try{
         problem.source = "leetcode";
         await leetcodeQuestion.create(problem);
         res.status(200).send("Problem added successfully");
        }
        catch(err){
            res.status(400).send(err.message);
        }
    }

    async addCFSolution(req, res){
        const {email, password, solution} = req.body;
    if(email!==process.env.ADMIN_EMAI){
            return res.status(403).send("Access Denied");
        }
        const admin = await User.findOne({email});
        if(!admin){
            return res.status(400).send("Admin not found");
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if(!isMatch){
            return res.status(400).send("Invalid Credentials");
        }

        try{
          await CFsolutions.create(solution);
          res.status(200).send("Solution added successfully");
        }
        catch(err){
            res.status(400).send(err.message);
        }
    }

    async addLCSolution(req, res){
        const {email, password, solution} = req.body;
    if(email!==process.env.ADMIN_EMAI){
            return res.status(403).send("Access Denied");
        }
        const admin = await User.findOne({email});
        if(!admin){
            return res.status(400).send("Admin not found");
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if(!isMatch){
            return res.status(400).send("Invalid Credentials");
        }

        try{
         await LeetCodeSolution.create(solution);
         res.status(200).send("Solution added successfully");
        }
        catch(err){
          res.status(400).send(err.message);
        }    
    }


}