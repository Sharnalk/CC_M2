const ArtistService = require('../services/ArtistService');

class ArtistController {
  async getAllArtists(req, res, next) {
    try {
      const { name, firstname, page, limit } = req.query;
      const result = await ArtistService.getAllArtists({ name, firstname, page, limit });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getArtistById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ArtistService.getArtistById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async createArtist(req, res, next) {
    try {
      const { firstname, lastname, birthDate, nationality, biography } = req.body;

      if (!firstname || !lastname) {
        return res.status(400).json({ message: 'First name and last name are required' });
      }

      const result = await ArtistService.createArtist({
        firstname,
        lastname,
        birthDate,
        nationality,
        biography
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateArtist(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ArtistService.updateArtist(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteArtist(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ArtistService.deleteArtist(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ArtistController();
