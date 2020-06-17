const express=require('express')
const router=express.Router()
const axios=require('axios');
const { request } = require('http');

var token=null;


const redirectlogin = function(req, res, next){
	if(req.session.token){
		next()
	}else{
		res.redirect('/')
	}
}

router.get('/home',redirectlogin,function(req,res){
    res.render('home',{hospital_name:req.session.data.name});
})

router.get('/',function(req,res){
    if(req.session.token){
        res.redirect('/home');
    }
    res.render('index',{error_msg:"" , info_msg:""});
})

router.get('/register',redirectlogin,function(req,res){
    res.render('register')
})

router.post('/registration',(req,res)=>{
    console.log(req.body)
    const hospitalData={
        name:req.body.hospitalName,
        email:req.body.email,
        password:req.body.password,
        openingTime:req.body.openingTime,
        closingTime:req.body.closingTime,
        coordLat:req.body.Latitude,
        coordLong:req.body.longitude
    }

    axios.post("http://localhost:5000/register",{
        params:{
            data:hospitalData
        }
    }).then(function(response){
        //console.log(response)
        if(response.data.status_code=="OK")
        {
            res.render('index',{error_msg:"",info_msg:"Registered Succesfully! Please Log in"})
        }
        if(response.data.status_code=="NOT OK")
        {
            res.render('index',{error_msg:"",info_msg:"User Already Exist"})
        }
    })
})


router.post('/login',(req,res)=>{
    const loginData={
        email:req.body.email,
        password:req.body.password
    }

    

    axios.post('http://localhost:5000/login',{
        params:{
            data:loginData
        }
    }).then(function(response){
        if(response.data.status_code=="OK")
        {
            req.session.token=response.data.token
            req.session.data=response.data.currData
            res.redirect('/home')
        }
        else
        {
            res.render('index',{error_msg:"WrongID/Password",info_msg:""});
        }
    })

})

router.get('/logout',function(req,res){
    req.session.destroy();
    res.redirect('/');
})

module.exports = router;