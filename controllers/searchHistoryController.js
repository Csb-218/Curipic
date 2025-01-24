const db = require('../models');
const { sequelize } = db

const {
    searchHistory: searchHistoryModel
} = sequelize.models

const getSearchHistory = async(req,res) => {

    const {userId} = req.query

    console.log(userId)

    if(!Number.isInteger(parseInt(userId))) return res.status(400).json({message: 'Invalid user id'})

    try{

        const history = await searchHistoryModel.findAll({
            where:{
                userId : parseInt(userId)
            }
        })

        if(!history || history.length === 0) return res.status(404).json({searchHistory:history})

        return res.status(200).json({"searchHistory":history})

    }catch(err){
        console.log(err)
        return res.status(500).json({ "error message": 'Internal Server Error'})
    }
}

module.exports = {getSearchHistory}