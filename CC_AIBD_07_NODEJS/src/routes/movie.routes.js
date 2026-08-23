const express = require('express');
const MovieController = require('../controllers/MovieController');
const RatingController = require('../controllers/RatingController');
const { protect, admin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

/**
 * @openapi
 * /api/movies:
 *   get:
 *     summary: Retrieve a paginated list of movies
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter movies by title (partial match)
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter movies by genre
 *       - in: query
 *         name: releaseYear
 *         schema:
 *           type: integer
 *         description: Filter movies by release year
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated movies list
 *         content:
 *           application/json:
 *             schema:
 *               type: OBJECT
 *               properties:
 *                 movies:
 *                   type: array
 *                   items:
 *                     type: OBJECT
 *                 pagination:
 *                   type: OBJECT
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', MovieController.getAllMovies);

/**
 * @openapi
 * /api/movies/{id}:
 *   get:
 *     summary: Get detail of a movie (including countries and associated artists)
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *     responses:
 *       200:
 *         description: Movie details with populated director and actors list
 *       404:
 *         description: Movie not found
 */
router.get('/:id', MovieController.getMovieById);

/**
 * @openapi
 * /api/movies/{movieId}/ratings:
 *   get:
 *     summary: Retrieve a paginated list of ratings of a movie
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: Movie ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of ratings for the movie
 *       404:
 *         description: Movie not found
 */
router.get('/:movieId/ratings', RatingController.getRatingsForMovie);

/**
 * @openapi
 * /api/movies:
 *   post:
 *     summary: Create a new movie (Admin Only)
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: OBJECT
 *             required:
 *               - title
 *               - releaseYear
 *               - genre
 *               - duration
 *               - director
 *             properties:
 *               title:
 *                 type: string
 *                 example: Inception
 *               description:
 *                 type: string
 *                 example: A thief who steals corporate secrets through the use of dream-sharing technology...
 *               releaseYear:
 *                 type: integer
 *                 example: 2010
 *               genre:
 *                 type: string
 *                 example: Sci-Fi
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *                 example: 148
 *               director:
 *                 type: string
 *                 description: Artist ID of the director
 *                 example: 60c72b2f9b1d8b2e88a0e888
 *               actors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of actor Artist IDs
 *                 example: ["60c72b2f9b1d8b2e88a0e889", "60c72b2f9b1d8b2e88a0e890"]
 *               countries:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["USA", "UK"]
 *     responses:
 *       201:
 *         description: Movie created successfully
 *       400:
 *         description: Missing fields or invalid artist references
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post('/', protect, admin, MovieController.createMovie);

/**
 * @openapi
 * /api/movies/{id}:
 *   put:
 *     summary: Update an existing movie (Admin Only)
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: OBJECT
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               releaseYear:
 *                 type: integer
 *               genre:
 *                 type: string
 *               duration:
 *                 type: integer
 *               director:
 *                 type: string
 *               actors:
 *                 type: array
 *                 items:
 *                   type: string
 *               countries:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *       404:
 *         description: Movie not found
 */
router.put('/:id', protect, admin, MovieController.updateMovie);

/**
 * @openapi
 * /api/movies/{id}:
 *   delete:
 *     summary: Delete a movie (Admin Only)
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 *       404:
 *         description: Movie not found
 */
router.delete('/:id', protect, admin, MovieController.deleteMovie);

/**
 * @openapi
 * /api/movies/{id}/summary:
 *   post:
 *     summary: Attach/upload a file to movie summary (Admin Only)
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: OBJECT
 *             required:
 *               - summary
 *             properties:
 *               summary:
 *                 type: string
 *                 format: binary
 *                 description: The summary file to upload (PDF, TXT, DOC, DOCX, or Image)
 *     responses:
 *       200:
 *         description: Summary file uploaded successfully
 *       400:
 *         description: No file uploaded or invalid format
 *       404:
 *         description: Movie not found
 */
router.post('/:id/summary', protect, admin, upload.single('summary'), MovieController.uploadSummary);

module.exports = router;
