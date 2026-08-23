const ArtistDto = require('./ArtistDto');

class MovieDto {
  constructor(movie) {
    this.id = movie._id || movie.id;
    this.title = movie.title;
    this.description = movie.description;
    this.releaseYear = movie.releaseYear;
    this.genre = movie.genre;
    this.duration = movie.duration;
    this.countries = movie.countries || null;
    this.summaryFile = movie.summaryFile;

    // Map director if populated
    if (movie.director) {
      if (movie.director._id || movie.director.id) {
        this.director = ArtistDto.toResponse(movie.director);
      } else {
        this.director = movie.director;
      }
    } else {
      this.director = null;
    }

    // Map actors if populated
    if (movie.actors) {
      if (movie.actors.length > 0 && (movie.actors[0]._id || movie.actors[0].id)) {
        this.actors = ArtistDto.toResponseList(movie.actors);
      } else {
        this.actors = movie.actors;
      }
    } else {
      this.actors = [];
    }
  }

  static toResponse(movie) {
    if (!movie) return null;
    return new MovieDto(movie);
  }

  static toResponseList(movies) {
    if (!movies) return [];
    return movies.map(movie => MovieDto.toResponse(movie));
  }
}

module.exports = MovieDto;
