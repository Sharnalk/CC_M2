const Artist = require('../models/Artist');

class ArtistRepository {
  async findAll({ name, firstname, page = 1, limit = 10 }) {
    const query = {};

    if (firstname) {
      query.firstname = { $regex: firstname, $options: 'i' };
    }

    if (name) {
      // Search in both firstname and lastname or just lastname
      query.$or = [
        { firstname: { $regex: name, $options: 'i' } },
        { lastname: { $regex: name, $options: 'i' } }
      ];
    }

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.max(1, parseInt(limit));
    const skip = (parsedPage - 1) * parsedLimit;

    const total = await Artist.countDocuments(query);
    const data = await Artist.find(query)
      .sort({ lastname: 1, firstname: 1 })
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
    return await Artist.findById(id);
  }

  async create(artistData) {
    const artist = new Artist(artistData);
    return await artist.save();
  }

  async update(id, artistData) {
    return await Artist.findByIdAndUpdate(id, artistData, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return await Artist.findByIdAndDelete(id);
  }
}

module.exports = new ArtistRepository();
