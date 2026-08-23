const RatingService = require('../services/RatingService');

class RatingController {
  async getRatingsForMovie(req, res, next) {
    try {
      const { movieId } = req.params;
      const { page, limit } = req.query;
      const result = await RatingService.getRatingsForMovie(movieId, { page, limit });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async addRating(req, res, next) {
    try {
      const { movieId, score, comment } = req.body;
      const userId = req.user.id;

      if (!movieId || score === undefined) {
        return res.status(400).json({ message: 'Movie ID and score are required' });
      }

      const result = await RatingService.addRating({
        userId,
        movieId,
        score,
        comment
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateRating(req, res, next) {
    try {
      const { id } = req.params;
      const { score, comment } = req.body;
      const userId = req.user.id;

      if (score === undefined) {
        return res.status(400).json({ message: 'Score is required for modification' });
      }

      const result = await RatingService.updateRating(id, userId, { score, comment });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteRating(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const result = await RatingService.deleteRating(id, userId, userRole);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RatingController();
