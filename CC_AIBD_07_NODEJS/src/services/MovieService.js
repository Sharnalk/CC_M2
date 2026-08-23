const MovieRepository = require('../repositories/MovieRepository');
const ArtistRepository = require('../repositories/ArtistRepository');
const MovieDto = require('../dtos/MovieDto');

class MovieService {
  async getAllMovies({ title, genre, releaseYear, page, limit }) {
    const result = await MovieRepository.findAll({ title, genre, releaseYear, page, limit });
    return {
      movies: MovieDto.toResponseList(result.data),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    };
  }

  async getMovieById(id) {
    const movie = await MovieRepository.findById(id);
    if (!movie) {
      const error = new Error('Movie not found');
      error.status = 404;
      throw error;
    }
    return MovieDto.toResponse(movie);
  }

  async getMoviesDirectedByArtist(artistId, { page, limit } = {}) {
    const artist = await ArtistRepository.findById(artistId);
    if (!artist) {
      const error = new Error('Artist not found');
      error.status = 404;
      throw error;
    }

    const result = await MovieRepository.findMoviesByDirector(artistId, { page, limit });
    return {
      movies: MovieDto.toResponseList(result.data),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    };
  }

  async createMovie(movieData) {
    // Validate director exists if provided
    if (movieData.director) {
      const director = await ArtistRepository.findById(movieData.director);
      if (!director) {
        const error = new Error('Director not found');
        error.status = 400;
        throw error;
      }
    }

    // Validate actors exist
    if (movieData.actors && Array.isArray(movieData.actors)) {
      for (const actorId of movieData.actors) {
        const actor = await ArtistRepository.findById(actorId);
        if (!actor) {
          const error = new Error(`Actor with ID ${actorId} not found`);
          error.status = 400;
          throw error;
        }
      }
    }

    const newMovie = await MovieRepository.create(movieData);
    const populatedMovie = await MovieRepository.findById(newMovie._id);
    return MovieDto.toResponse(populatedMovie);
  }

  async updateMovie(id, movieData) {
    const movie = await MovieRepository.findById(id);
    if (!movie) {
      const error = new Error('Movie not found');
      error.status = 404;
      throw error;
    }

    // Validate director exists if modified
    if (movieData.director) {
      const director = await ArtistRepository.findById(movieData.director);
      if (!director) {
        const error = new Error('Director not found');
        error.status = 400;
        throw error;
      }
    }

    // Validate actors exist if modified
    if (movieData.actors && Array.isArray(movieData.actors)) {
      for (const actorId of movieData.actors) {
        const actor = await ArtistRepository.findById(actorId);
        if (!actor) {
          const error = new Error(`Actor with ID ${actorId} not found`);
          error.status = 400;
          throw error;
        }
      }
    }

    const updatedMovie = await MovieRepository.update(id, movieData);
    return MovieDto.toResponse(updatedMovie);
  }

  async deleteMovie(id) {
    const movie = await MovieRepository.findById(id);
    if (!movie) {
      const error = new Error('Movie not found');
      error.status = 404;
      throw error;
    }
    await MovieRepository.delete(id);
    return { message: 'Movie deleted successfully' };
  }

  async uploadSummaryFile(id, filename) {
    const movie = await MovieRepository.findById(id);
    if (!movie) {
      const error = new Error('Movie not found');
      error.status = 404;
      throw error;
    }

    const updatedMovie = await MovieRepository.update(id, { summaryFile: filename });
    return MovieDto.toResponse(updatedMovie);
  }
}

module.exports = new MovieService();
