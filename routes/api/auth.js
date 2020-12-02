const express = require ('express') 
const router = express.Router()
const bcrypt = require('bcryptjs')
const auth = require ('../../middleware/auth')
const jwt = require('jsonwebtoken')
const config = require('config')
const {check, validationResult} = require ('express-validator')
const User =require('../../models/User')







// 
router.get('/', auth, async(req,res)=> {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error')
        
    }

})
router.post('/',[
    
    check('email', 'Please include email').isEmail(),
    check('password','password is required').exists()
 ] ,
 async(req, res)=> {
     const errors = validationResult(req);
     if (!errors.isEmpty()){
         return res.status(404).json({errors: errors.array()})
     }
     
     const { email, password }= req.body;   
     
     try {
      // see user existence
      let user = await User.findOne({ email})
      if(!user) {
          return res.status(400).json({errors: [{msg: "invalid credentials"}]})
 
      }
     
    // make sure password matches
    
      
     const isMatch = await bcrypt.compare(password, user.password);
     if(!isMatch){
        return res.status(400).json({errors: [{msg: "invalid credentials"}]})

     }

 
     const payload = {
         user:{
             id: user.id
         }
     }
     jwt.sign(
         payload, 
         config.get('jwtSecret'),
         {expiresIn: 3600000},
          (err, token) =>{
              if(err) throw err;
              res.json({token})
 
         })
     } catch (err) {
         console.error(err.message);
         res.status(500).send('server error');
         
     }
 
 
 
 }
 );

module.exports = router