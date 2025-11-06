import express from 'express';
import { reverseGeocode, searchLocation } from '../controllers/geocoding.controller.js';

const router = express.Router();

// GET /api/geocoding/reverse?lat=19.076&lon=72.877
router.get('/reverse', reverseGeocode);

// GET /api/geocoding/search?q=Mumbai
router.get('/search', searchLocation);

export default router;