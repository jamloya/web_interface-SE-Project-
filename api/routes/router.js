const express=require('express')
const router=express.Router();
const cors=require('cors')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')

//schema object
const hospital=require('../hospitalData.js').Hospital
const witness=require('../hospitalData.js').Witness
const emergency=require('../hospitalData.js').Emergency

let emergencies=[]
let it=-1;
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }
  
  function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    var earthRadiusKm = 6371;
  
    var dLat = degreesToRadians(lat2-lat1);
    var dLon = degreesToRadians(lon2-lon1);
  
    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);
  
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return earthRadiusKm * c;
  }



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
                    currData:payload,
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
    console.log(req.body)
const witnessData={
    number:req.body.number,
    name:req.body.name
}

    witness.findOne({
        number:req.body.number
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
        number:req.body.number,
        coordinates:[req.body.coordLat,req.body.coordLong],
        description:req.body.description,
        landmark:req.body.landmark
    }
    let case_id;
    emergency.create(emergencyData).then(curr =>{
        case_id=curr._id
        witness.update({number:req.body.number},{$push:{cases:curr._id}})
        res.json({status_code:"OK"})
    }).catch(err=>{
        res.json({status_code:"NOT OK"})
    })
    
    hospital.find({}).then(hospitals=>{
        let curr=0,result=distanceInKmBetweenEarthCoordinates(hospitals[0].address[0].latitude,hospitals[0].address[0].longitude,req.body.coordLat,req.body.coordLong);
        for(i=1;i<hospitals.length();i++)
        {
            if(result>distanceInKmBetweenEarthCoordinates(hospitals[0].address[0].latitude,hospitals[0].address[0].longitude,req.body.coordLat,req.body.coordLong))
            {
                curr=i;
            }
        }
        emergencies.push([case_id,hospitals[curr]._id,0])
        it+=1;
    })
})

router.get('/getAlerts',function(req,res){
    let casesid=[]
    for(i=it;i<emergencies.length();i++)
    {
        if(req.body.id==emergencies[i][1] && emergencies[i][2]==0)
        {
            emergencies[i][2]=1
            casesid.push(emergencies[i][0]);
        }
    }
    let cases=[]
    casesid.forEach(element => {
        emergency.findOne({_id:element}).then(curr=>{
            cases.push(curr);
        })
    });
    res.send(cases)
})


module.exports =router