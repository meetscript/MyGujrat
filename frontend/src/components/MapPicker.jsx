import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { MapPin, Loader2, Search, Locate } from 'lucide-react'
import toast from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component to handle map clicks
const LocationMarker = ({ position, setPosition, setLocationName }) => {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng]
      setPosition(newPos)
      reverseGeocode(e.latlng.lat, e.latlng.lng, setLocationName)
    },
  })

  return position ? <Marker position={position} draggable={true} eventHandlers={{
    dragend: (e) => {
      const marker = e.target
      const pos = marker.getLatLng()
      setPosition([pos.lat, pos.lng])
      reverseGeocode(pos.lat, pos.lng, setLocationName)
    }
  }} /> : null
}

// Component to recenter map
const RecenterMap = ({ position }) => {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom())
    }
  }, [position, map])
  return null
}

// Reverse geocoding using backend proxy
const reverseGeocode = async (lat, lng, setLocationName) => {
  try {
    const response = await fetch(
      `/api/geocoding/reverse?lat=${lat}&lon=${lng}`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding failed')
    }
    
    const result = await response.json()
    const data = result.data
    
    if (data.display_name) {
      setLocationName(data.display_name)
    } else if (data.address) {
      // Build address from components
      const addr = data.address
      const parts = [
        addr.road || addr.neighbourhood,
        addr.suburb || addr.city || addr.town || addr.village,
        addr.state,
        addr.country
      ].filter(Boolean)
      setLocationName(parts.join(', ') || `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    } else {
      setLocationName(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    // Fallback: just show coordinates
    setLocationName(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
  }
}

// Forward geocoding (search) using backend proxy
const searchLocation = async (query, setPosition, setLocationName, setIsSearching) => {
  try {
    setIsSearching(true)
    const response = await fetch(
      `/api/geocoding/search?q=${encodeURIComponent(query)}`
    )
    
    if (!response.ok) {
      throw new Error('Search failed')
    }
    
    const result = await response.json()
    const data = result.data
    
    if (data && data.length > 0) {
      const { lat, lon, display_name } = data[0]
      setPosition([parseFloat(lat), parseFloat(lon)])
      setLocationName(display_name)
      toast.success('Location found!')
    } else {
      toast.error('Location not found')
    }
  } catch (error) {
    console.error('Search error:', error)
    toast.error('Search failed. Please try again.')
  } finally {
    setIsSearching(false)
  }
}

const MapPicker = ({ onLocationSelect, onClose }) => {
  const [position, setPosition] = useState([19.076, 72.8777]) // Default: Mumbai
  const [locationName, setLocationName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = [pos.coords.latitude, pos.coords.longitude]
          setPosition(userPos)
          reverseGeocode(pos.coords.latitude, pos.coords.longitude, setLocationName)
          setIsLoading(false)
        },
        () => {
          // If permission denied, use default location
          setLocationName('Mumbai, Maharashtra, India')
          setIsLoading(false)
        }
      )
    } else {
      setLocationName('Mumbai, Maharashtra, India')
      setIsLoading(false)
    }
  }, [])

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a location')
      return
    }
    searchLocation(searchQuery, setPosition, setLocationName, setIsSearching)
  }

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = [pos.coords.latitude, pos.coords.longitude]
          setPosition(userPos)
          reverseGeocode(pos.coords.latitude, pos.coords.longitude, setLocationName)
          setIsLoading(false)
          toast.success('Location updated!')
        },
        () => {
          toast.error('Unable to get your location')
          setIsLoading(false)
        }
      )
    } else {
      toast.error('Geolocation is not supported')
    }
  }

  const handleConfirm = () => {
    if (position && locationName) {
      onLocationSelect({
        lat: position[0],
        lng: position[1],
        name: locationName,
      })
    } else {
      toast.error('Please select a location')
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60]">
      <div className="bg-base-100 rounded-2xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Select Location</h3>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              ✕
            </button>
          </div>

          {/* Info Message */}
          <div className="alert alert-info mb-3 py-2 text-xs">
            <span>💡 Click on the map or drag the marker to select a location</span>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for a location..."
              className="input input-bordered flex-1 input-sm"
              disabled={isSearching}
            />
            <button 
              onClick={handleSearch} 
              className="btn btn-primary btn-sm"
              disabled={isSearching}
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
            <button 
              onClick={handleCurrentLocation} 
              className="btn btn-outline btn-sm"
              title="Use my location"
              disabled={isLoading}
            >
              <Locate className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-base-200 z-10">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          )}
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '400px', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker 
              position={position} 
              setPosition={setPosition}
              setLocationName={setLocationName}
            />
            <RecenterMap position={position} />
          </MapContainer>
        </div>

        {/* Selected Location Display */}
        <div className="p-4 border-t border-base-300">
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Selected Location:</p>
              <p className="text-sm text-base-content/70">
                {locationName || 'Click on the map to select a location'}
              </p>
            </div>
          </div>
          <button
            onClick={handleConfirm}
            disabled={!locationName}
            className="btn btn-primary w-full"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  )
}

export default MapPicker