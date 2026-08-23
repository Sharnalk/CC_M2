const mongoose = require('mongoose');
const Rating = require('../models/Rating');

class RatingRepository {
  async findAllByMovieId(movieId, { page = 1, limit = 10 } = {}) {
    const query = { movie: movieId };

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, parseInt(limit));
    const skip = (parsedPage - 1) * parsedLimit;

    const total = await Rating.countDocuments(query);
    const data = await Rating.find(query)
      .populate('user', 'username') // Only populate ID and username
      .populate('movie', 'title genre releaseYear')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);

    return {
      data,
      total,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(total / parsedLimit)
    };
  }

  async findById(id) {
    return await Rating.findById(id)
      .populate('user', 'username')
      .populate('movie', 'title');
  }

  async findByUserAndMovie(userId, movieId) {
    return await Rating.findOne({ user: userId, movie: movieId });
  }

  async create(ratingData) {
    const rating = new Rating(ratingData);
    await rating.save();
    return await this.findById(rating._id);
  }

  async update(id, ratingData) {
    return await Rating.findByIdAndUpdate(id, ratingData, {
      new: true,
      runValidators: true
    }).populate('user', 'username').populate('movie', 'title');
  }

  async delete(id) {
    return await Rating.findByIdAndDelete(id);
  }

  async getAverageRatingForMovie(movieId) {
    const stats = await Rating.aggregate([
      { $match: { movie: new mongoose.Types.ObjectId(movieId) } },
      { $group: { _id: '$movie', avgRating: { $avg: '$score' }, count: { $sum: 1 } } }
    ]);
    return stats.length > 0 ? stats[0] : { avgRating: 0, count: 0 };
  }
}

module.exports = new RatingRepository();
