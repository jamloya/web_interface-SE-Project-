const express=require('express')
const router=express.Router()
const axios=require('axios')

const token=null;



router.get('/',function(req,res){
    res.render('index');
})


router.post('/register',(req,res)=>{
    const hospitalData={
        name:req.body.name,
        password:req.body.password,
        email:req.body.email,
        coordLat:req.body.coordLat,
        coordLong:req.body.coordLong
    }

    axios.get("http://localhost:8080",{
        params:{
            data:hospitalData
        }
    }).then(function(response){
        if(response.Status_code=="OK")
        {

            window.localStorage.setItem('my_token',response.token);
            res.json({ status: req.body.email+"registred"})
        }
        if(response.Status_code=="NOT OK")
        {
            res.json("User Already Exist");
        }
    })
})



router.post('/login',(req,res)=>{
    const loginData={
        email:req.body.email,
        password:req.body.password
    }


    axios.get('http://localhost:8080',{
        params:{
            data:loginData
        }
    }).then(function(response){
        if(response.Status_code)
        {
            window.localStorage.setItem('my_token',response.token);
            res.send('successfull login');
        }
        else
        {
            res.send('wrond ID/Password');
        }
    })

})

module.exports = router;