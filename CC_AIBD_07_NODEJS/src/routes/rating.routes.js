const express = require('express');
const RatingController = require('../controllers/RatingController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

/**
 * @openapi
 * /api/ratings:
 *   post:
 *     summary: Add a new rating for a movie
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: OBJECT
 *             required:
 *               - movieId
 *               - score
 *             properties:
 *               movieId:
 *                 type: string
 *                 description: ID of the movie being rated
 *                 example: 60c72b2f9b1d8b2e88a0e888
 *               score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Score from 1 to 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 description: Optional text review
 *                 example: Absolute masterpiece! Highly recommended.
 *     responses:
 *       201:
 *         description: Rating added successfully
 *       400:
 *         description: Already rated, score out of range, or invalid movie
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, RatingController.addRating);

/**
 * @openapi
 * /api/ratings/{id}:
 *   put:
 *     summary: Modify an existing rating (Owner Only)
 *     tags: [Ratings]
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
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Still great, but noticed a few plot holes upon rewatching.
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *       403:
 *         description: Forbidden (Not the owner of the rating)
 *       404:
 *         description: Rating not found
 */
router.put('/:id', protect, RatingController.updateRating);

/**
 * @openapi
 * /api/ratings/{id}:
 *   delete:
 *     summary: Delete a rating (Owner or Admin Only)
 *     tags: [Ratings]
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
 *         description: Rating deleted successfully
 *       403:
 *         description: Forbidden (Not authorized to delete)
 *       404:
 *         description: Rating not found
 */
router.delete('/:id', protect, RatingController.deleteRating);

module.exports = router;
