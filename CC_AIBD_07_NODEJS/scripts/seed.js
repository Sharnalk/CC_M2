const mongoose = require('mongoose');
const config = require('../src/config/config');
const User = require('../src/models/User');
const Artist = require('../src/models/Artist');
const Movie = require('../src/models/Movie');
const Rating = require('../src/models/Rating');

async function seed() {
  await mongoose.connect(config.mongodbUri);
  console.log(`Connected to ${config.mongodbUri}`);

  console.log('Dropping database...');
  await mongoose.connection.dropDatabase();

  console.log('Creating users...');
  const [admin, alice, bob] = await User.create([
    { username: 'admin', password: 'admin1234', role: 'admin' },
    { username: 'alice', password: 'password123', role: 'user' },
    { username: 'bob', password: 'password123', role: 'user' }
  ]);

  console.log('Creating artists...');
  const [nolan, tarantino, dicaprio, pitt, cotillard] = await Artist.create([
    { firstname: 'Christopher', lastname: 'Nolan', birthDate: new Date('1970-07-30'), nationality: 'British-American', biography: 'Director known for Inception, Interstellar and The Dark Knight trilogy.' },
    { firstname: 'Quentin', lastname: 'Tarantino', birthDate: new Date('1963-03-27'), nationality: 'American', biography: 'Director known for Pulp Fiction and Kill Bill.' },
    { firstname: 'Leonardo', lastname: 'DiCaprio', birthDate: new Date('1974-11-11'), nationality: 'American', biography: 'Academy Award-winning actor.' },
    { firstname: 'Brad', lastname: 'Pitt', birthDate: new Date('1963-12-18'), nationality: 'American', biography: 'Actor and producer.' },
    { firstname: 'Marion', lastname: 'Cotillard', birthDate: new Date('1975-09-30'), nationality: 'French', biography: 'French actress.' }
  ]);

  console.log('Creating movies...');
  const [inception, onceUponATime] = await Movie.create([
    {
      title: 'Inception',
      description: 'A thief who steals corporate secrets through dream-sharing technology.',
      releaseYear: 2010,
      genre: 'Sci-Fi',
      duration: 148,
      director: nolan._id,
      actors: [dicaprio._id, cotillard._id],
      countries: 'USA'
    },
    {
      title: 'Once Upon a Time in Hollywood',
      description: 'A faded TV actor and his stunt double navigate the changing film industry of 1969 Los Angeles.',
      releaseYear: 2019,
      genre: 'Comedy-Drama',
      duration: 161,
      director: tarantino._id,
      actors: [dicaprio._id, pitt._id],
      countries: 'USA'
    }
  ]);

  console.log('Creating ratings...');
  await Rating.create([
    { user: alice._id, movie: inception._id, score: 5, comment: 'Mind-bending masterpiece.' },
    { user: bob._id, movie: inception._id, score: 4, comment: 'Great but confusing on first watch.' },
    { user: alice._id, movie: onceUponATime._id, score: 4, comment: 'Loved the 1969 atmosphere.' }
  ]);

  console.log('Seed complete:');
  console.log(`  Users: admin/admin1234, alice/password123, bob/password123`);
  console.log(`  Artists: ${await Artist.countDocuments()}`);
  console.log(`  Movies: ${await Movie.countDocuments()}`);
  console.log(`  Ratings: ${await Rating.countDocuments()}`);

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
