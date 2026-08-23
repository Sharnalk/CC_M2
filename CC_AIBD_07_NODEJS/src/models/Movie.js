const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    releaseYear: {
      type: Number,
      required: [true, 'Release year is required']
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Duration is required']
    },
    director: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      required: [true, 'Director is required']
    },
    actors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
      }
    ],
    countries:
    {
        type: String,
        trim: true
      }
,
    summaryFile: {
      type: String, // Filename or filepath of the uploaded summary
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
