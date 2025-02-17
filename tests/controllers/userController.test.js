const { createNewUser } = require("../../controllers/userController");
const { sequelize } = require('../../models');
const { photo: photosModel, tag: tagsModel, user: userModel, phototags: photoTagModel, searchHistory: searchHistoryModel } = sequelize.models;

jest.mock('../../models', () => ({
  sequelize: {
    models: {
      user: {
        create: jest.fn(),
        findOne: jest.fn()
      }
    }
  }
}));

describe("userController Tests", () => {
 

  describe("createNewUser", () => {
    beforeEach(async () => {
      jest.clearAllMocks();
    });

    it("should create a new user and return 201 status", async () => {
      const mockUser = { id: 1, username: 'John Doe', email: 'john.doe@example.com' };

      userModel.create.mockResolvedValue(mockUser);
      userModel.findOne.mockResolvedValue(null);

      const req = {
        body: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        }
      };

      const res = {
        status: jest.fn(() => res),
        json: jest.fn()
      };

      await createNewUser(req, res);

      expect(userModel.findOne).toHaveBeenCalledWith({ where: { email: 'john.doe@example.com' } });
      expect(userModel.create).toHaveBeenCalledWith({ username: 'John Doe', email: 'john.doe@example.com' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        'message': 'User created successfully',
        'user': mockUser
      });
    });

    it("should return 400 if name or email is missing", async () => {
      const req = {
        body: {}
      };

      const res = {
        status: jest.fn(() => res),
        json: jest.fn()
      };

      await createNewUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name and email are required' });
    });

    it("should return 400 if email is invalid", async () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'invalid-email'
        }
      };

      const res = {
        status: jest.fn(() => res),
        json: jest.fn()
      };

      await createNewUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email address' });
    });

    it("should return 400 if user already exists", async () => {
      const mockUser = { id: 1, username: 'John Doe', email: 'john.doe@example.com' };

      userModel.findOne.mockResolvedValue(mockUser);

      const req = {
        body: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        }
      };

      const res = {
        status: jest.fn(() => res),
        json: jest.fn()
      };

      await createNewUser(req, res);

      expect(userModel.findOne).toHaveBeenCalledWith({ where: { email: 'john.doe@example.com' } });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });

    it("should return 500 if an error occurs", async () => {
      userModel.findOne.mockRejectedValue(new Error('Database error'));

      const req = {
        body: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        }
      };

      const res = {
        status: jest.fn(() => res),
        json: jest.fn()
      };

      await createNewUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});