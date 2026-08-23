class RatingDto {
  constructor(rating) {
    this.id = rating._id || rating.id;
    this.score = rating.score;
    this.comment = rating.comment;
    this.createdAt = rating.createdAt;

    // Check user population
    if (rating.user) {
      if (rating.user.username) {
        this.user = {
          id: rating.user._id || rating.user.id,
          username: rating.user.username
        };
      } else {
        this.user = rating.user;
      }
    } else {
      this.user = null;
    }

    // Check movie population
    if (rating.movie) {
      if (rating.movie.title) {
        this.movie = {
          id: rating.movie._id || rating.movie.id,
          title: rating.movie.title,
          genre: rating.movie.genre,
          releaseYear: rating.movie.releaseYear
        };
      } else {
        this.movie = rating.movie;
      }
    } else {
      this.movie = null;
    }
  }

  static toResponse(rating) {
    if (!rating) return null;
    return new RatingDto(rating);
  }

  static toResponseList(ratings) {
    if (!ratings) return [];
    return ratings.map(rating => RatingDto.toResponse(rating));
  }
}

module.exports = RatingDto;
