const express=require('express')
const router=express.Router();
const cors=require('cors')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')

//schema object
const hospital=require('../hospitalData.js').Hospital
const witness=require('../hospitalData.js').Witness
const emergency=require('../hospitalData.js').Emergency


process.env.SECRET_KEY='jatin'

router.post('/register',(req,res)=>{
     const hospitalData={
         hospitalName:req.body.params.data.name,
         email:req.body.params.data.email,
         password:req.body.params.data.password,
         openingTime:req.body.params.data.openingTime,
         closingTime:req.body.params.data.closingTime,
         adress:[req.body.params.data.coordLat,req.body.params.data.coordLong]
     }
     hospital.findOne({
         email:req.body.params.data.email
     }).then(user => {
         //console.log(user)
         if(!user)
         {
             bcrypt.hash(req.body.params.data.password,10,(err,hash)=>{
                 hospitalData.password=hash
                 hospital.create(hospitalData)
                 .then(user=>{
                     res.json({status_code:"OK"})
                 }).catch(err =>{
                     res.json({status_code:"NOT OK"})
                 })
             })
         }
         else
         {
            res.json({status_code:"NOT OK"})
         }
     }).catch(err=>{
         res.json({status_code:"NOT OK"})
     })
})


router.post('/login',(req,res)=>{
    hospital.findOne({
        email:req.body.params.data.email
    }).then(user=>{
        if(user){
            
            if(bcrypt.compareSync(req.body.params.data.password,user.password)){
                const payload={
                    name:user.hospitalName,
                    email:user.email,
                    _id:user._id
                }
                let token=jwt.sign(payload,process.env.SECRET_KEY ,{
                    expiresIn:1440
                })
                res.json({
                    status_code:"OK",
                    token:token
                })
            }
            else{
                res.json({
                    status_code:"NOT OK",
                    msg:"Password Dont match"
                })
            }
        }
        else
        {
            res.json({
                status_code:"NOT OK",
                msg:"User Dont Exist"
            })
        }
    }).catch(err =>{
        res.json({
            status_code:"NOT OK",
            msg:"Undefined Error"
        })
    })
})


router.post('/addWitness',(req,res)=>{
const witnessData={
    number:req.body.params.data.number,
    name:req.body.params.data.name
}

    witness.findOne({
        number:req.body.params.data.number
    }).then(currwitness=>{
        if(!currwitness)
        {
            witness.create(witnessData).then(user=>{
                res.json({status_code:"OK"})
            }).catch(err=>{
                res.json({status_code:"NOT OK"})
            })
        }
        else
        {
            res.json({status_code:"OK"})
        }
    })
})

router.post('/postEmergency',(req,res)=>{
    const emergencyData={
        number:req.body.params.data.number,
        coordinates:[req.body.params.data.longitude,req.body.params.data.latitude],
        description:req.body.params.data.description,
        landmark:req.body.params.data.landmark
    }
    emergency.create(emergencyData).then(curr =>{
        witness.update({number:req.body.params.data.number},{$push:{cases:curr._id}})
        res.json({status_code:"OK"})
    }).catch(err=>{
        res.json({status_code:"NOT OK"})
    })
    
})


module.exports =router