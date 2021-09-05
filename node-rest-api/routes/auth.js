const router = require("express").Router();
const User = require("../models/User");
const {PolyBcrypt} = require("poly-crypto");

//REGISTER
router.post("/register", async (req,res) => {

    try {
        // generate new password hash
        const hashedPassword = await PolyBcrypt.hash(req.body.password);


        // create new user
        const newUser = await new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            
        });

        // save user and return response
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error);
    }
})

//LOGIN
router.post("/login", async (req,res) => {

    try {
        const user = await User.findOne({email:req.body.email});
        !user && res.status(404).send("user not found");
        
        const validPassword = await PolyBcrypt.verify(req.body.password, user.password)
        !validPassword && res.status(400).json("wrong password");

        res.status(200).json(user);

    } catch (error) {
        res.status(500).json(error);
    }

    
})

module.exports = router;