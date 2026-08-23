class ArtistDto {
  constructor(artist) {
    this.id = artist._id || artist.id;
    this.firstname = artist.firstname;
    this.lastname = artist.lastname;
    this.fullName = artist.fullName || `${artist.firstname} ${artist.lastname}`;
    this.birthDate = artist.birthDate;
    this.nationality = artist.nationality;
    this.biography = artist.biography;
  }

  static toResponse(artist) {
    if (!artist) return null;
    return new ArtistDto(artist);
  }

  static toResponseList(artists) {
    if (!artists) return [];
    return artists.map(artist => ArtistDto.toResponse(artist));
  }
}

module.exports = ArtistDto;
