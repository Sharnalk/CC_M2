const ArtistRepository = require('../repositories/ArtistRepository');
const MovieRepository = require('../repositories/MovieRepository');
const ArtistDto = require('../dtos/ArtistDto');
const MovieDto = require('../dtos/MovieDto');

class ArtistService {
  async getAllArtists({ name, firstname, page, limit }) {
    const result = await ArtistRepository.findAll({ name, firstname, page, limit });
    return {
      artists: ArtistDto.toResponseList(result.data),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    };
  }

  async getArtistById(id) {
    const artist = await ArtistRepository.findById(id);
    if (!artist) {
      const error = new Error('Artist not found');
      error.status = 404;
      throw error;
    }

    // Fetch directed and acted movies
    const directedResult = await MovieRepository.findMoviesByDirector(id, { limit: 50 });
    const actedMovies = await MovieRepository.findMoviesByActor(id);

    return {
      ...ArtistDto.toResponse(artist),
      directedMovies: MovieDto.toResponseList(directedResult.data),
      actedMovies: MovieDto.toResponseList(actedMovies)
    };
  }

  async createArtist(artistData) {
    const newArtist = await ArtistRepository.create(artistData);
    return ArtistDto.toResponse(newArtist);
  }

  async updateArtist(id, artistData) {
    const artist = await ArtistRepository.findById(id);
    if (!artist) {
      const error = new Error('Artist not found');
      error.status = 404;
      throw error;
    }
    const updatedArtist = await ArtistRepository.update(id, artistData);
    return ArtistDto.toResponse(updatedArtist);
  }

  async deleteArtist(id) {
    const artist = await ArtistRepository.findById(id);
    if (!artist) {
      const error = new Error('Artist not found');
      error.status = 404;
      throw error;
    }
    await ArtistRepository.delete(id);
    return { message: 'Artist deleted successfully' };
  }
}

module.exports = new ArtistService();
