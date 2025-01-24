const db = require('../models');
const { sequelize } = db
const { Op } = require('sequelize');

const axiosInstance = require('../lib/axiosInstance');

const {
    photo: photosModel,
    tag: tagsModel,
    user: userModel,
    phototags : photoTagModel,
    searchHistory: searchHistoryModel
} = sequelize.models


console.log(sequelize.models,11)

const searchPhotos = async (req, res) => {

    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Query is required' });

    try {
        const options = {
            method: 'GET',
            url: '/search/photos',
            params: { query: query }
        }

        const response = await axiosInstance.request(options)

        if (response.data.results.length === 0) return res.status(404).json({ message: 'No photos found' })

        const photos = response.data.results.map(photo => {
            return {
                id: photo.id,
                description: photo.description,
                url: photo.urls.regular,
                alt_description: photo.alt_description
            }
        })

        res.status(200).json({ photos: photos })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal server error' })
    }
}

const savePhoto = async (req, res) => {


    const { imageUrl, description, altDescription, tags, userId } = req.body;

    if (!imageUrl)return res.status(400).json({ "error message": "parameter 'imageUrl' is missing " })

    if (!imageUrl.startsWith('https://images.unsplash.com/')) return res.status(400).json({ "error message": 'Invalid image URL' })

    if (!description || description?.length<1)return res.status(400).json({ "error message": "parameter 'description' is missing " })

    if (!altDescription || altDescription?.length<1) return res.status(400).json({ "error message": "parameter 'altDescription' is missing " })

    if (!tags) return res.status(400).json({ "error message": "parameter 'tags' is missing " })

    if (!Array.isArray(tags)) return res.status(400).json({ "error message": " parameter 'tags' value should be an array of strings " })

    if( !tags?.every(tag => tag.length>1)) return res.status(400).json({ "error message": " parameter 'tags' value should be an array of valid string tags " })

    if (!userId) return res.status(400).json({ "error message": "parameter 'userId' is missing " })

    try {



        const isUserIdPresent = await userModel.findOne({ where: { id: userId } })

        if(!isUserIdPresent) return res.status(400).json({"error message": "user id not found"})

        const newPhoto = await photosModel.create({ imageUrl, description, altDescription, userId })

        if (newPhoto) {

            for (let tag of tags) {

                const isTag = await tagsModel.findOne({
                    where: {
                        name : tag
                    }
                })

                if(!isTag){
                    const newTag = await tagsModel.create({ name: tag })
                    
                    photoTagModel.create({
                        tag_id:newTag.id,
                        photo_id:newPhoto.id
                    })


                }else{


                    photoTagModel.create({
                        tag_id:isTag.id,
                        photo_id:newPhoto.id
                    })

                }
                    // return res.status(400).json({"error message" : "invalid tags "})
            }
            

        }

        return res.status(201).json({'message': 'Photo saved successfully'})


    } catch (error) {
        console.error(error)

        return res.status(500).json({"error message" : "Internal Server Error"})

    }




}

const changePhotoTags = async (req, res) => {


    const {  tags } = req.body;
    const { photoId } = req.params;

    if(!photoId) return res.status(400).json({"error message" : " 'photoId' is required "})
    if(!tags) return res.status(400).json({"error message" : " 'tags' required "})
    if(tags.length <= 0) return res.status(400).json({"error message" : " at least one tag is required "})

   
    try {

       const photo = await photosModel.findByPk(parseInt(photoId))

        if (photo) {

            for (let tag of tags) {

                const isTag = await tagsModel.findOne({
                    where: {
                        name : tag
                    }
                })

                if(!isTag){

                    const newTag = await tagsModel.create({ name: tag })

                    photoTagModel.create({
                        tag_id:newTag.id,
                        photo_id:photo.id
                    })

                }else{

                    photoTagModel.create({
                        tag_id:isTag.id,
                        photo_id:photo.id
                    })

                } // return res.status(400).json({"error message" : "invalid tags "})
            }
            
            return res.status(201).json({'message': 'Photo saved successfully'})
        }

        return res.status(400).json({'error message': 'Photo not found with id ' + photoId})


    } catch (error) {
        console.error(error)

        return res.status(500).json({"error message" : "Internal Server Error"})

    }
}

const searchByTag = async(req,res) =>{

    const {tag,sort,userId} = req.query

    console.log(sort)


    if(!tag) return res.status(400).json({"error message" : "tag not provided"})
    
    if(!parseInt(userId)) return res.status(400).json({"error message" : "userId not provided"})

    if(sort !== "ASC" && sort !== "DESC") return res.status(400).json({"error message" : "Incorrect sort order"})

    // search history

    await searchHistoryModel.create({
        userId:userId,
        query : tag
    })


    try{

        const _tag = await tagsModel.findOne({
            where : {
                name : tag
            }
        })

        if(!tag || tag.length <=0) return res.status(400).json({"error message" : "tag not found"})

        const phototags = await photoTagModel.findAll({
            where:{
                tag_id : _tag.dataValues.id
            }
        })

        if(!phototags || phototags.length <=0) return res.status(400).json({"error message" :  "tag not found"})

        const photos = await photosModel.findAll({
            where:{
                id: {
                    [Op.in]: phototags.map(item=>item.dataValues.photo_id)
                },
                userId : userId
            },
            order: [
                ['createdAt', sort]
            ]
        })

        if(photos.length <= 0) return res.status(404).json({"error message" : "No photos found "})

        

        
        

        return res.status(200).json({"photos":photos})
       
    }catch(err){
        console.error(err)
        return res.status(500).json({"error message" : "Internal Server Error"})
    }
    


}

module.exports = {
    searchPhotos,
    savePhoto,
    changePhotoTags,
    searchByTag
}