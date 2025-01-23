const db = require('../models');
const { sequelize } = db;

const axiosInstance = require('../lib/axiosInstance');

const {
    photo: photosModel,
    tags: tagsModel,
    user: userModel,
} = sequelize.models

console.log(sequelize.models)
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

                if(!isTag) return res.status(400).json({"error message" : "invalid tags "})

                isTag.photoId = newPhoto.id ;

                await isTag.save();

            }

        }

        return res.status(201).json({'message': 'Photo saved successfully'})


    } catch (error) {
        console.error(error)

        return res.status(500).json({"error message" : "Internal server error"})

    }




}

module.exports = {
    searchPhotos,
    savePhoto
}