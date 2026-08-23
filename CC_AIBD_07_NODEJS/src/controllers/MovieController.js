const MovieService = require('../services/MovieService');

class MovieController {
  async getAllMovies(req, res, next) {
    try {
      const { title, genre, releaseYear, page, limit } = req.query;
      const result = await MovieService.getAllMovies({ title, genre, releaseYear, page, limit });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMovieById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await MovieService.getMovieById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMoviesDirectedByArtist(req, res, next) {
    try {
      const { artistId } = req.params;
      const { page, limit } = req.query;
      const result = await MovieService.getMoviesDirectedByArtist(artistId, { page, limit });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async createMovie(req, res, next) {
    try {
      const { title, description, releaseYear, genre, duration, director, actors, countries } = req.body;

      if (!title || !releaseYear || !genre || !duration || !director) {
        return res.status(400).json({
          message: 'Title, release year, genre, duration, and director are required'
        });
      }

      const result = await MovieService.createMovie({
        title,
        description,
        releaseYear,
        genre,
        duration,
        director,
        actors,
        countries
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateMovie(req, res, next) {
    try {
      const { id } = req.params;
      const result = await MovieService.updateMovie(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteMovie(req, res, next) {
    try {
      const { id } = req.params;
      const result = await MovieService.deleteMovie(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async uploadSummary(req, res, next) {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or invalid file type' });
      }

      const result = await MovieService.uploadSummaryFile(id, req.file.filename);
      res.status(200).json({
        message: 'Summary file uploaded successfully',
        movie: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MovieController();
