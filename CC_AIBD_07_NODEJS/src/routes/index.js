const express = require('express');
const authRoutes = require('./auth.routes');
const artistRoutes = require('./artist.routes');
const movieRoutes = require('./movie.routes');
const ratingRoutes = require('./rating.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/artists', artistRoutes);
router.use('/movies', movieRoutes);
router.use('/ratings', ratingRoutes);

module.exports = router;
