const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastname: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    birthDate: {
      type: Date
    },
    nationality: {
      type: String,
      trim: true
    },
    biography: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual for full name
artistSchema.virtual('fullName').get(function () {
  return `${this.firstname} ${this.lastname}`;
});

// Ensure virtuals are serialized
artistSchema.set('toJSON', { virtuals: true });
artistSchema.set('toObject', { virtuals: true });

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
