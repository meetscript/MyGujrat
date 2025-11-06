// controllers/geocoding.controller.js
import axios from 'axios';

// Reverse Geocoding - Convert coordinates to address
export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        success: false, 
        message: "Latitude and longitude are required" 
      });
    }

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          format: 'jsonv2',
          lat: lat,
          lon: lon,
        },
        headers: {
          'User-Agent': 'YourAppName/1.0', // REQUIRED by Nominatim
          'Accept': 'application/json',
        }
      }
    );

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reverse geocode',
      error: error.message,
    });
  }
};

// Forward Geocoding - Search for location
export const searchLocation = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        success: false, 
        message: "Search query is required" 
      });
    }

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          format: 'json',
          q: q,
          limit: 5,
        },
        headers: {
          'User-Agent': 'YourAppName/1.0', // REQUIRED by Nominatim
          'Accept': 'application/json',
        }
      }
    );

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error('Location search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search location',
      error: error.message,
    });
  }
};