const Movie = require('../models/Movie');

class MovieRepository {
  async findAll({ title, genre, releaseYear, page = 1, limit = 10 }) {
    const query = {};

    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    if (genre) {
      query.genre = { $regex: genre, $options: 'i' };
    }

    if (releaseYear) {
      query.releaseYear = parseInt(releaseYear);
    }

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, parseInt(limit));
    const skip = (parsedPage - 1) * parsedLimit;

    const total = await Movie.countDocuments(query);
    const data = await Movie.find(query)
      .populate('director')
      .populate('actors')
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

  async findMoviesByDirector(directorId, { page = 1, limit = 10 } = {}) {
    const query = { director: directorId };

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, parseInt(limit));
    const skip = (parsedPage - 1) * parsedLimit;

    const total = await Movie.countDocuments(query);
    const data = await Movie.find(query)
      .populate('director')
      .populate('actors')
      .sort({ releaseYear: -1 })
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

  async findMoviesByActor(actorId) {
    // Return all movies where the artist is an actor, populated
    return await Movie.find({ actors: actorId })
      .populate('director')
      .populate('actors')
      .sort({ releaseYear: -1 });
  }

  async findById(id) {
    return await Movie.findById(id)
      .populate('director')
      .populate('actors');
  }

  async create(movieData) {
    const movie = new Movie(movieData);
    return await movie.save();
  }

  async update(id, movieData) {
    return await Movie.findByIdAndUpdate(id, movieData, {
      new: true,
      runValidators: true
    }).populate('director').populate('actors');
  }

  async delete(id) {
    return await Movie.findByIdAndDelete(id);
  }
}

module.exports = new MovieRepository();
