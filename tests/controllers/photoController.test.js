const { searchPhotos, savePhoto, changePhotoTags, searchByTag } = require("../../controllers/photosController");
const axiosInstance = require("../../lib/axiosInstance");
const { sequelize } = require('../../models');
const { Op } = require('sequelize');
const { photo: photosModel, tag: tagsModel, user: userModel, phototags: photoTagModel, searchHistory: searchHistoryModel } = sequelize.models;

jest.mock('../../lib/axiosInstance', () => ({
    get: jest.fn(),
    post: jest.fn(),
    request: jest.fn()
}));

describe("photoController Tests", () => {

    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });


    describe("searchPhotos", () => {

        beforeEach(async () => {

            jest.clearAllMocks();
        });
    
        afterEach(async () => {

            jest.clearAllMocks();
        });

        it("should search photos by query", async () => {
            const mockResponse = {
                data: {
                    results: [
                        {
                            id: "IicyiaPYGGI",
                            description: null,
                            urls: { // Corrected to match the expected structure
                                regular: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2OTQ1NDF8MHwxfHNlYXJjaHwxfHxuYXR1cmV8ZW58MHx8fHwxNzM3NzQ3NjUzfDA&ixlib=rb-4.0.3&q=80&w=1080"
                            },
                            alt_description: "orange flowers"
                        }
                    ]
                }
            };

            axiosInstance.request.mockResolvedValue(mockResponse);

            const req = {
                query: { query: "nature" }
            };

            const res = {
                json: jest.fn(),
                status: jest.fn(() => res)
            };

            const options = {
                method: 'GET',
                url: '/search/photos',
                params: { query: req.query.query }
            };

            await searchPhotos(req, res);

            expect(axiosInstance.request).toHaveBeenCalledWith(options);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                photos: mockResponse.data.results.map(photo => ({
                    id: photo.id,
                    description: photo.description,
                    url: photo.urls.regular, // Ensure this matches the structure of the mock response
                    alt_description: photo.alt_description
                }))
            });
        });

        it("should return 400 if query is missing in search", async () => {
            const req = {
                query: {}
            };

            const res = {
                json: jest.fn(),
                status: jest.fn(() => res)
            };

            await searchPhotos(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Query is required' });
        });

        it("should return 404 if no photos are found", async () => {
            const mockResponse = {
                data: {
                    results: []
                }
            };

            axiosInstance.request.mockResolvedValue(mockResponse);

            const req = {
                query: { query: "nature" }
            };

            const res = {
                json: jest.fn(),
                status: jest.fn(() => res)
            };

            await searchPhotos(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'No photos found' });
        });
    })

    describe("savePhoto", () => {

        beforeEach(async () => {

            jest.clearAllMocks();
        });
    
        afterEach(async () => {

            jest.clearAllMocks();
        });

        it("should save a photo", async () => {

            const mockUser = { id: 1 };
            const mockPhoto = {
                imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2OTQ1NDF8MHwxfHNlYXJjaHwxfHxuYXR1cmV8ZW58MHx8fHwxNzM3NzQ3NjUzfDA&ixlib=rb-4.0.3&q=80&w=1080",
                description: "Nature",
                altDescription: "Nature",
                userId: 1
            }

            const mockTag = ['nature'];

            userModel.findOne = jest.fn().mockResolvedValue(mockUser);
            photosModel.create = jest.fn().mockResolvedValue(mockPhoto);
            tagsModel.findOne = jest.fn().mockResolvedValue(null);
            tagsModel.create = jest.fn().mockResolvedValue(mockTag);
            photoTagModel.create = jest.fn().mockResolvedValue({});

            const req = {
                body: {
                    imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2OTQ1NDF8MHwxfHNlYXJjaHwxfHxuYXR1cmV8ZW58MHx8fHwxNzM3NzQ3NjUzfDA&ixlib=rb-4.0.3&q=80&w=1080",
                    description: "Nature",
                    altDescription: "Nature",
                    tags: ["nature"],
                    userId: 1
                }
            };

            const res = {
                json: jest.fn(),
                status: jest.fn(() => res)
            };

            await savePhoto(req, res);


            expect(userModel.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(photosModel.create).toHaveBeenCalledWith(mockPhoto);
            expect(tagsModel.findOne).toHaveBeenCalledWith({ where: { name: 'nature' } });
            expect(tagsModel.create).toHaveBeenCalledWith({ name: 'nature' });
            expect(photoTagModel.create).toHaveBeenCalledWith({
                tag_id: mockTag.id,
                photo_id: mockPhoto.id
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'Photo saved successfully' });



        });

        it("should return 400 if imageUrl is missing in savePhoto", async () => {
            const req = {
                body: {}
            };

            const res = {
                json: jest.fn(),
                status: jest.fn(() => res)
            };

            await savePhoto(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ "error message": "parameter 'imageUrl' is missing " });
        });

        it("should return 400 if imageUrl is invalid in savePhoto", async () => {
            const req = {
                body: {
                    imageUrl: "https://example.com/image.jpg"
                }
            };

            const res = {
                json: jest.fn(),
                status: jest.fn(() => res)
            };

            await savePhoto(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ "error message": 'Invalid image URL' });
        });

        it("should return 400 if description is missing in savePhoto", async () => {
            const req = {
                body: {
                    imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2OTQ1NDF8MHwxfHNlYXJjaHwxfHxuYXR1cmV8ZW58MHx8fHwxNzM3NzQ3NjUzfDA&ixlib=rb-4.0.3&q=80&w=1080"
                }
            };

            const res = {
                json: jest.fn(),
                status: jest.fn(() => res)
            };

            await savePhoto(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ "error message": "parameter 'description' is missing " });
        });

        it("should return 400 if altDescription is missing in savePhoto", async () => {
            const req = {
                body: {
                    imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2OTQ1NDF8MHwxfHNlYXJjaHwxfHxuYXR1cmV8ZW58MHx8fHwxNzM3NzQ3NjUzfDA&ixlib=rb-4.0.3&q=80&w=1080",
                    description: "Nature"
                }
            };

            const res = {
                json: jest.fn(),
                status: jest.fn(() => res)
            };

            await savePhoto(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ "error message": "parameter 'altDescription' is missing " });
        });

        it("should return 400 if tags is missing in savePhoto", async () => {
            const req = {
                body: {
                    imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2OTQ1NDF8MHwxfHNlYXJjaHwxfHxuYXR1cmV8ZW58MHx8fHwxNzM3NzQ3NjUzfDA&ixlib=rb-4.0.3&q=80&w=1080",
                    description: "Nature",
                    altDescription: "Nature"
                }
            };

            const res = {
                json: jest.fn(),
                status: jest.fn(() => res)
            };

            await savePhoto(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ "error message": "parameter 'tags' is missing " });
        });

        it("should return 400 if tags is not an array in savePhoto", async () => {
            const req = {
                body: {
                    imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2OTQ1NDF8MHwxfHNlYXJjaHwxfHxuYXR1cmV8ZW58MHx8fHwxNzM3NzQ3NjUzfDA&ixlib=rb-4.0.3&q=80&w=1080",
                    description: "Nature",
                    altDescription: "Nature",
                    tags: "nature"
                }
            };

            const res = {
                json: jest.fn(),
                status: jest.fn(() => res)
            };

            await savePhoto(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ "error message": " parameter 'tags' value should be an array of strings " });
        });

        it("should return 400 if tags value is not valid in savePhoto", async () => {
            const req = {
                body: {
                    imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2OTQ1NDF8MHwxfHNlYXJjaHwxfHxuYXR1cmV8ZW58MHx8fHwxNzM3NzQ3NjUzfDA&ixlib=rb-4.0.3&q=80&w=1080",
                    description: "Nature",
                    altDescription: "Nature",
                    tags: [""]
                }
            };

            const res = {
                json: jest.fn(),
                status: jest.fn(() => res)
            };

            await savePhoto(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ "error message": " parameter 'tags' value should be an array of valid string tags " });
        });

        it("should return 400 if userId is missing in savePhoto", async () => {
            const req = {
                body: {
                    imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2OTQ1NDF8MHwxfHNlYXJjaHwxfHxuYXR1cmV8ZW58MHx8fHwxNzM3NzQ3NjUzfDA&ixlib=rb-4.0.3&q=80&w=1080",
                    description: "Nature",
                    altDescription: "Nature",
                    tags: ["nature"]
                }
            };

            const res = {
                json: jest.fn(),
                status: jest.fn(() => res)
            };

            await savePhoto(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ "error message": "parameter 'userId' is missing " });
        });
    })

    describe("changePhotoTags", () => {

        beforeEach(async () => {

            jest.clearAllMocks();
        });
    
        afterEach(async () => {

            jest.clearAllMocks();
        });

        it("should change photo tags and return 201 status", async () => {
            const mockPhoto = { id: 1 };
            const mockTag = { id: 1, name: 'nature' };

            photosModel.findByPk = jest.fn().mockResolvedValue(mockPhoto);
            tagsModel.findOne = jest.fn().mockResolvedValue(null);
            tagsModel.create = jest.fn().mockResolvedValue(mockTag);
            photoTagModel.create = jest.fn().mockResolvedValue({});

            const req = {
                params: { photoId: 1 },
                body: { tags: ['nature'] }
            };

            const res = {
                status: jest.fn(() => res),
                json: jest.fn()
            };

            await changePhotoTags(req, res);

            expect(photosModel.findByPk).toHaveBeenCalledWith(1);
            expect(tagsModel.findOne).toHaveBeenCalledWith({ where: { name: 'nature' } });
            expect(tagsModel.create).toHaveBeenCalledWith({ name: 'nature' });
            expect(photoTagModel.create).toHaveBeenCalledWith({
                tag_id: mockTag.id,
                photo_id: mockPhoto.id
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'Photo tags changed successfully' });
        });

        it("should return 400 if photoId is missing", async () => {
            const req = {
                params: {},
                body: { tags: ['nature'] }
            };

            const res = {
                status: jest.fn(() => res),
                json: jest.fn()
            };

            await changePhotoTags(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ "error message": " 'photoId' is required " });
        });

        it("should return 400 if tags are missing", async () => {
            const req = {
                params: { photoId: 1 },
                body: {}
            };

            const res = {
                status: jest.fn(() => res),
                json: jest.fn()
            };

            await changePhotoTags(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ "error message": " 'tags' required " });
        });

        it("should return 400 if photo is not found", async () => {
            photosModel.findByPk = jest.fn().mockResolvedValue(null);

            const req = {
                params: { photoId: 1 },
                body: { tags: ['nature'] }
            };

            const res = {
                status: jest.fn(() => res),
                json: jest.fn()
            };

            await changePhotoTags(req, res);

            expect(photosModel.findByPk).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 'error message': 'Photo not found with id 1' });
        });

        it("should return 500 if an error occurs", async () => {
            photosModel.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

            const req = {
                params: { photoId: 1 },
                body: { tags: ['nature'] }
            };

            const res = {
                status: jest.fn(() => res),
                json: jest.fn()
            };

            await changePhotoTags(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ "error message": "Internal Server Error" });
        });
    });

    describe("searchByTag", () => {

    beforeEach(async () => {

        jest.clearAllMocks();
    });


    it("should return photos by tag", async () => {
      const mockTag = { id: 1, name: 'nature' };
      const mockPhotoTag = { photo_id: 1, tag_id: 1 };
      const mockPhoto = { id: 1, userId: 1, imageUrl: 'https://example.com/photo.jpg', description: 'A photo', altDescription: 'A photo' };

      tagsModel.findOne = jest.fn().mockResolvedValue(mockTag);
      photoTagModel.findAll = jest.fn().mockResolvedValue([mockPhotoTag]);
      photosModel.findAll = jest.fn().mockResolvedValue([mockPhoto]);
      searchHistoryModel.create = jest.fn().mockResolvedValue({});

      const req = {
        query: { tag: 'nature', sort: 'ASC', userId: 1 }
      };

      const res = {
        status: jest.fn(() => res),
        json: jest.fn()
      };

      await searchByTag(req, res);

      expect(tagsModel.findOne).toHaveBeenCalledWith({ where: { name: 'nature' } });
      expect(photoTagModel.findAll).toHaveBeenCalledWith({ where: { tag_id: mockTag.id } });
      expect(photosModel.findAll).toHaveBeenCalledWith({
        where: {
          id: { [Op.in]: [mockPhotoTag.photo_id] },
          userId: 1
        },
        order: [['createdAt', 'ASC']]
      });
      expect(searchHistoryModel.create).toHaveBeenCalledWith({ userId: 1, query: 'nature' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ photos: [mockPhoto] });
    });

    it("should return 400 if tag is not provided", async () => {
      const req = {
        query: { sort: 'ASC', userId: 1 }
      };

      const res = {
        status: jest.fn(() => res),
        json: jest.fn()
      };

      await searchByTag(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ "error message": "tag not provided" });
    });

    it("should return 400 if userId is not provided", async () => {
      const req = {
        query: { tag: 'nature', sort: 'ASC' }
      };

      const res = {
        status: jest.fn(() => res),
        json: jest.fn()
      };

      await searchByTag(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ "error message": "userId not provided" });
    });

    it("should return 400 if sort order is incorrect", async () => {
      const req = {
        query: { tag: 'nature', sort: 'INVALID', userId: 1 }
      };

      const res = {
        status: jest.fn(() => res),
        json: jest.fn()
      };

      await searchByTag(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ "error message": "Incorrect sort order" });
    });
    
    it("should return 404 if tag is not found", async () => {
        tagsModel.findOne = jest.fn().mockResolvedValue(null);
  
        const req = {
          query: { tag: 'nature', sort: 'ASC', userId: 1 }
        };
  
        const res = {
          status: jest.fn(() => res),
          json: jest.fn()
        };
  
        await searchByTag(req, res);
  
        expect(tagsModel.findOne).toHaveBeenCalledWith({ where: { name: 'nature' } });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ "error message": "tag not found" });
      });

    it("should return 404 if no photos are found", async () => {

      const mockTag = { id: 1, name: 'nature' };

      tagsModel.findOne = jest.fn().mockResolvedValue(mockTag);
      photoTagModel.findAll = jest.fn().mockResolvedValue([]);
      searchHistoryModel.create = jest.fn().mockResolvedValue({});

      const req = {
        query: { tag: 'nature', sort: 'ASC', userId: 1 }
      };

      const res = {
        status: jest.fn(() => res),
        json: jest.fn()
      };

      await searchByTag(req, res);

      expect(tagsModel.findOne).toHaveBeenCalledWith({ where: { name: 'nature' } });
      expect(photoTagModel.findAll).toHaveBeenCalledWith({ where: { tag_id: mockTag.id } });
     
      expect(res.json).toHaveBeenCalledWith({"error message": "No photos found" }); 
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 500 if an error occurs", async () => {
      tagsModel.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      const req = {
        query: { tag: 'nature', sort: 'ASC', userId: 1 }
      };

      const res = {
        status: jest.fn(() => res),
        json: jest.fn()
      };

      await searchByTag(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ "error message": "Internal Server Error" });
    });

    });

    

});










