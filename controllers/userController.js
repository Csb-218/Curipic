const db = require('../models');
const { sequelize } = db
const {isValidEmail,isValidName} = require('../utils/helpers')

const {
    user: userModel,
} = sequelize.models



const createNewUser = async(req, res) => {

    const { name, email } = req.body;

    try {

        if(!name || !email) return res.status(400).json({message : 'Name and email are required'})
        
        if (!isValidEmail(email)) return res.status(400).json({message : 'Invalid email address'})
         
        if (!isValidName(name)) return res.status(400).json({message : 'Invalid name. Name should be between 1 and 100 characters'})
        
        if (await doesUserExist(email)) return res.status(400).json({message : 'User already exists'})
        

        const newUser = await userModel.create({ username : name, email })

        res.status(201).json(
            {
                'message': 'User created successfully',
                'user': newUser
            }
        )

    }catch(err){
        console.error(err)
        res.status(500).json({ message: 'Internal server error' })
    }
    
}


const doesUserExist = async (email) => {
    const user = await userModel.findOne({ where: { email: email } })
    if (user) {
        return true
    }
    return false
}

module.exports = {
    createNewUser
}