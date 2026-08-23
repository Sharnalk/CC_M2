const request = require('supertest');
const app = require('../src/app');
const dbHandler = require('./setup');

beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clear());
afterAll(async () => await dbHandler.close());


describe('Cinema API - parcours essentiel', () => {

  it('Registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'password123' });

    expect(res.statusCode).toBe(201);
    expect(res.body.username).toBe('testuser');
    expect(res.body).not.toHaveProperty('password');
  });

  it('Connects a user and returns a JWT token', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'loginuser', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'loginuser', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('Lists movies (public route, with pagination)', async () => {
    const res = await request(app).get('/api/movies');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('movies');
    expect(res.body).toHaveProperty('pagination');
  });

  it('Admin can create a movie', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'admin1', password: 'password123', role: 'admin' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin1', password: 'password123' });
    const token = loginRes.body.token;

    const artistRes = await request(app)
      .post('/api/artists')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstname: 'Christopher', lastname: 'Nolan' });

    const res = await request(app)
      .post('/api/movies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Inception',
        releaseYear: 2010,
        genre: 'Sci-Fi',
        duration: 148,
        director: artistRes.body.id
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Inception');
  });

  it('Cannot update movie without being logged in as admin', async () => {
    const res = await request(app)
      .post('/api/movies')
      .send({ title: 'Sans Auth', releaseYear: 2024, genre: 'Drame', duration: 90 });

    expect(res.statusCode).toBe(401);
  });

});
