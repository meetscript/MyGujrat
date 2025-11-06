import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { MapPin, X, ExternalLink } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const LocationMapDialog = ({ open, setOpen, location }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, setOpen])

  if (!open) return null

  // Check if location data is valid
  if (!location || !location.lat || !location.lng) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60]">
        <div className="bg-base-100 p-6 rounded-2xl shadow-lg w-96 relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex flex-col items-center gap-3 py-4">
            <MapPin className="w-12 h-12 text-base-content/40" />
            <p className="text-center text-base-content/70">
              Sorry, location for this post is not available
            </p>
            <button 
              onClick={() => setOpen(false)}
              className="btn btn-primary btn-sm mt-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const position = [location.lat, location.lng]
  const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60]">
      <div className="bg-base-100 rounded-2xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Post Location</h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={position}
            zoom={15}
            style={{ height: '400px', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                <div className="text-sm">
                  <p className="font-medium mb-1">{location.name || 'Post Location'}</p>
                  <p className="text-xs text-base-content/60">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-300">
          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Location:</p>
            <p className="text-sm text-base-content/70">{location.name}</p>
            <p className="text-xs text-base-content/50 mt-1">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open in Google Maps
            </a>
            <button 
              onClick={() => setOpen(false)}
              className="btn btn-outline btn-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationMapDialog;