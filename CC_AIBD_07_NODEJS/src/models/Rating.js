const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required']
    },
    score: {
      type: Number,
      required: [true, 'Rating score is required'],
      min: [1, 'Score must be at least 1'],
      max: [5, 'Score cannot be more than 5']
    },
    comment: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure a user can only rate a movie once
ratingSchema.index({ user: 1, movie: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
