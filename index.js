const express = require("express");
const jwt = require ("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {z} = require("zod");

const app =express();
app.use(express.json())
const JWT_SECRET = "";
mongoose.connect("");
const {UsersModel , TodosModel} = require("./db")

const signupSchema = z.object({
    name:z.string().min(7).max(20),
    email:z.string().email(),
    password:z.string()
    .regex(/^[A-Z]/)
    .min(10)
    .max(20)
    .regex(/[@#%$^*?,._&%!]/)
});
const signinSchema = z.object({
    email:z.string().email(),
    password:z.string()
    .min(10)
    .max(20)
    .regex(/^[A-Z]/)
    .regex(/[@!#$%^&*_?><:]/)
});
const todoSchema = z.object({
    title:z.string()
    .min(10)
    .max(30),
    done:z.boolean()
});

function auth(req , res, next){
    try{
        const token = req.headers.token
        const verify = jwt.verify(token , JWT_SECRET);
        if(verify){
            req.userId = verify.id;
            next();
            
           
        }else{
            res.status(401).json({
                message:"invaild token"
            })
        }
  
      
    }catch(e){
        res.status(401).json({
            message :"incorrect credential",
        })

    }
};

app.post("/signup", async (req , res) =>{
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.errors });
    }

    const { name, email, password } = parsed.data;

    try{
       
        const securepass = await bcrypt.hash(password , 5);
        await UsersModel.create({
            name:name,
            email:email,
            password:securepass
            
        
        });
        res.json({
            message:"you are signed up"
        });

    }catch(e){
        res.status(401).json({
            mesaage:"incoorect credential"
        });
    }
});

app.post("/signin",async (req , res)=>{
    const parsed = signinSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.errors });
    }

    const {email, password } = parsed.data;
    try{
        
        const user = await UsersModel.findOne({
            email:email
        });
        if(!user){
            return res.status(400).json({
                message:"User not Found"
         });
        }
        
        const PasswordMatch = await  bcrypt.compare(password , user.password);
        if(!PasswordMatch){
            return res.status(403).json({
            message:"Password does not match"
         });
        }

        const token = jwt.sign({
            id:user._id
        }, JWT_SECRET)
        res.json({
            token:token
        })

        
        
    }catch(e){
        res.status(402).json({
            message:"signin failed",
            error:e.message
        })
    }
  

});

app.post("/todo" ,auth ,async (req , res)=>{
    const parsed = todoSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.errors });
    }

    
    const {title , done } = parsed.data;
    

    try{
        
        const todo = await TodosModel.create({
            userId:req.userId,
            title:title,
            done:done
        });
        res.json({
            message:"todo added",todo
        })

    }catch(e){
        res.status(401).json({
            message:"error in creating todo"
        });

    };
    
});
app.get("/todos", auth , async (req , res) =>{
    
    try{
        const todos = await TodosModel.find({
            userId:req.userId

        });
       
            res.json({
                todos})
         

    }catch(e){
        res.status(500).json({
            message:"error"
        })
    }
});

app.listen(3000 ,()=>{
    console.log("server is running in port 3000")
});
