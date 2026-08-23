const express = require('express');
const ArtistController = require('../controllers/ArtistController');
const MovieController = require('../controllers/MovieController');
const { protect, admin } = require('../middlewares/auth');

const router = express.Router();

/**
 * @openapi
 * /api/artists:
 *   get:
 *     summary: Retrieve a paginated list of artists
 *     tags: [Artists]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter artists by last name or partial last/first name
 *       - in: query
 *         name: firstname
 *         schema:
 *           type: string
 *         description: Filter artists by first name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of artists per page
 *     responses:
 *       200:
 *         description: Paginated artists list
 *         content:
 *           application/json:
 *             schema:
 *               type: OBJECT
 *               properties:
 *                 artists:
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
router.get('/', ArtistController.getAllArtists);

/**
 * @openapi
 * /api/artists/{id}:
 *   get:
 *     summary: Get detail of an artist (info, directed movies, acted movies)
 *     tags: [Artists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Artist ID
 *     responses:
 *       200:
 *         description: Artist details with associated movies
 *       404:
 *         description: Artist not found
 */
router.get('/:id', ArtistController.getArtistById);

/**
 * @openapi
 * /api/artists/{artistId}/directed:
 *   get:
 *     summary: Retrieve a paginated list of movies directed by a given artist
 *     tags: [Artists]
 *     parameters:
 *       - in: path
 *         name: artistId
 *         required: true
 *         schema:
 *           type: string
 *         description: Director's Artist ID
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
 *         description: Paginated list of directed movies
 *       404:
 *         description: Artist not found
 */
router.get('/:artistId/directed', MovieController.getMoviesDirectedByArtist);

/**
 * @openapi
 * /api/artists:
 *   post:
 *     summary: Create a new artist (Admin Only)
 *     tags: [Artists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: OBJECT
 *             required:
 *               - firstname
 *               - lastname
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: Christopher
 *               lastname:
 *                 type: string
 *                 example: Nolan
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "1970-07-30"
 *               nationality:
 *                 type: string
 *                 example: British-American
 *               biography:
 *                 type: string
 *                 example: Christopher Nolan is a British-American film director...
 *     responses:
 *       201:
 *         description: Artist successfully created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post('/', protect, admin, ArtistController.createArtist);

/**
 * @openapi
 * /api/artists/{id}:
 *   put:
 *     summary: Update an artist's details (Admin Only)
 *     tags: [Artists]
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
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               nationality:
 *                 type: string
 *               biography:
 *                 type: string
 *     responses:
 *       200:
 *         description: Artist successfully updated
 *       404:
 *         description: Artist not found
 */
router.put('/:id', protect, admin, ArtistController.updateArtist);

/**
 * @openapi
 * /api/artists/{id}:
 *   delete:
 *     summary: Delete an artist (Admin Only)
 *     tags: [Artists]
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
 *         description: Artist deleted successfully
 *       404:
 *         description: Artist not found
 */
router.delete('/:id', protect, admin, ArtistController.deleteArtist);

module.exports = router;
