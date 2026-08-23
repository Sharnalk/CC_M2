const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const UserDto = require('../dtos/UserDto');
const config = require('../config/config');

class AuthService {
  async register({ username, password, role }) {
    const existingUser = await UserRepository.findByUsername(username);
    if (existingUser) {
      const error = new Error('Username is already taken');
      error.status = 400;
      throw error;
    }

    const newUser = await UserRepository.create({
      username,
      password,
      role: role || 'user'
    });

    return UserDto.toResponse(newUser);
  }

  async login({ username, password }) {
    const user = await UserRepository.findByUsername(username);
    if (!user) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    const token = this.generateToken(user);

    return {
      token,
      user: UserDto.toResponse(user)
    };
  }

  generateToken(user) {
    return jwt.sign(
      { id: user._id || user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }
}

module.exports = new AuthService();
