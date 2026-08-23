class UserDto {
  constructor(user) {
    this.id = user._id || user.id;
    this.username = user.username;
    this.role = user.role;
    this.createdAt = user.createdAt;
  }

  static toResponse(user) {
    if (!user) return null;
    return new UserDto(user);
  }

  static toResponseList(users) {
    if (!users) return [];
    return users.map(user => UserDto.toResponse(user));
  }
}

module.exports = UserDto;
