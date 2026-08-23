const RatingRepository = require('../repositories/RatingRepository');
const MovieRepository = require('../repositories/MovieRepository');
const RatingDto = require('../dtos/RatingDto');

class RatingService {
  async getRatingsForMovie(movieId, { page, limit } = {}) {
    const movie = await MovieRepository.findById(movieId);
    if (!movie) {
      const error = new Error('Movie not found');
      error.status = 404;
      throw error;
    }

    const result = await RatingRepository.findAllByMovieId(movieId, { page, limit });
    return {
      ratings: RatingDto.toResponseList(result.data),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    };
  }

  async addRating({ userId, movieId, score, comment }) {
    // Check if movie exists
    const movie = await MovieRepository.findById(movieId);
    if (!movie) {
      const error = new Error('Movie not found');
      error.status = 404;
      throw error;
    }

    // Check if user already rated this movie
    const existingRating = await RatingRepository.findByUserAndMovie(userId, movieId);
    if (existingRating) {
      const error = new Error('You have already rated this movie');
      error.status = 400;
      throw error;
    }

    const newRating = await RatingRepository.create({
      user: userId,
      movie: movieId,
      score,
      comment
    });

    return RatingDto.toResponse(newRating);
  }

  async updateRating(ratingId, userId, { score, comment }) {
    const rating = await RatingRepository.findById(ratingId);
    if (!rating) {
      const error = new Error('Rating not found');
      error.status = 404;
      throw error;
    }

    // Verify rating belongs to the user
    // Convert both to string just in case they are ObjectIds or strings
    if (rating.user.toString() !== userId.toString() && rating.user.id !== userId) {
      const error = new Error('Unauthorized to modify this rating');
      error.status = 403;
      throw error;
    }

    const updatedRating = await RatingRepository.update(ratingId, { score, comment });
    return RatingDto.toResponse(updatedRating);
  }

  async deleteRating(ratingId, userId, userRole) {
    const rating = await RatingRepository.findById(ratingId);
    if (!rating) {
      const error = new Error('Rating not found');
      error.status = 404;
      throw error;
    }

    // Verify rating belongs to user, or user is admin
    const isOwner = rating.user.toString() === userId.toString() || rating.user.id === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      const error = new Error('Unauthorized to delete this rating');
      error.status = 403;
      throw error;
    }

    await RatingRepository.delete(ratingId);
    return { message: 'Rating deleted successfully' };
  }
}

module.exports = new RatingService();
