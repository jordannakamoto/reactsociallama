const User = require('../models/User');
const router = require("express").Router();
const {PolyBcrypt} = require("poly-crypto");

// update user
router.put("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin){ // if requesting user matches the id we want to update. or requesting user is an Admin
        // update password
        if(req.body.password){
            try {
                req.body.password = await PolyBcrypt.hash(req.body.password);
                
            } catch (error) {
                return res.status(500).json(error);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id,{$set: req.body});
            res.status(200).json("Account has been updated");
        } catch (error) {
            return res.status(500).json(error);
        }
    }else{
        return res.status(403).json("You can only update your own account!")
    }
})

// delete user
router.delete("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin){
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted successfully");
        } catch (error) {
            return res.status(500).json(error);
        }
    }else{
        return res.status(403).json("You can only delete your own account!")
    }
})

// get a user
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const {password,updatedAt, ...other} = user._doc // from document, create object with fields seperated
        res.status(200).json(other);
    } catch (error) {
        res.status(200).json(error);
    }
})

// follow a user
router.put("/:id/follow", async (req, res) => {
    if(req.body.userId !== req.params.id){  // are the requesting and target users the same?
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if(!user.followers.includes(currentUser.id)){  // if target user isn't already being followed by requesting user
                await user.updateOne({$push:{followers:currentUser.id}});
                await currentUser.updateOne({$push:{following:user.id}});
                res.status(200).json("user has been followed");
            }else{
                res.status(403).json("You are already following this user");
            }
        } catch (error) {
            res.status(500).json(error)
        }
    }else{
        res.status(403).json("You can't folllow yourself")
    }
})

// unfollow a user
router.put("/:id/unfollow", async (req, res) => {
    if(req.body.userId !== req.params.id){  // are the requesting and target users the same?
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if(user.followers.includes(currentUser.id)){  // if target user is being followed by requesting user
                await user.updateOne({$pull:{followers:currentUser.id}});
                await currentUser.updateOne({$pull:{following:user.id}});
                res.status(200).json("user has been unfollowed");
            }else{
                res.status(403).json("You are aren't following this user");
            }
        } catch (error) {
            res.status(500).json(error)
        }
    }else{
        res.status(403).json("You can't unfolllow yourself")
    }
})

module.exports = router;