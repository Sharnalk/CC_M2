const AuthService = require('../services/AuthService');

class AuthController {
  async register(req, res, next) {
    try {
      const { username, password, role } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const result = await AuthService.register({ username, password, role });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const result = await AuthService.login({ username, password });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const UserRepository = require('../repositories/UserRepository');
      const UserDto = require('../dtos/UserDto');
      const user = await UserRepository.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(UserDto.toResponse(user));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
