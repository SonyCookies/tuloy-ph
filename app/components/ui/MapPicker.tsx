'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import { Navigation, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  onChange?: (lat: number, lng: number) => void;
  addressSnippet?: string;
  readOnly?: boolean;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapPicker({ lat, lng, onChange, addressSnippet, readOnly = false }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number]>(
    lat && lng ? [lat, lng] : [13.786195308994552, 121.0746513845086] // Default Batangas Location
  );
  const [isFullMapOpen, setIsFullMapOpen] = useState(false);

  useEffect(() => {
    if (lat && lng) {
      setPosition([lat, lng]);
    }
  }, [lat, lng]);

  useEffect(() => {
    if (isFullMapOpen) {
      document.body.classList.add('hide-bottom-nav');
    } else {
      document.body.classList.remove('hide-bottom-nav');
    }
    return () => document.body.classList.remove('hide-bottom-nav');
  }, [isFullMapOpen]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        if (readOnly) return;
        const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
        setPosition(newPos);
        onChange?.(e.latlng.lat, e.latlng.lng);
      },
    });

    return position ? <Marker position={position} /> : null;
  }

  const handleGetCurrentLocation = () => {
    if (readOnly) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        onChange?.(latitude, longitude);
      });
    }
  };

  return (
    <div className="relative space-y-3">
      {!readOnly && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pin Location</span>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-all bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10"
          >
            <Navigation className="w-3 h-3" />
            Use Current
          </button>
        </div>
      )}
      
      <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] relative z-0">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
          <ChangeView center={position} />
        </MapContainer>
        
        {/* Visual Cue Overlay */}
        {!readOnly && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-100">
               <p className="text-[9px] font-black text-neutral-dark uppercase tracking-widest whitespace-nowrap">
                 Tap anywhere to pin your dorm
               </p>
            </div>
          </div>
        )}

        {/* Fullscreen Toggle Button */}
        <button
          type="button"
          onClick={() => setIsFullMapOpen(true)}
          className="absolute top-4 right-4 z-[400] w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-neutral-dark hover:bg-white transition-all group"
        >
          <Maximize2 className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Fullscreen Map Overlay */}
      <AnimatePresence>
        {isFullMapOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-white flex flex-col"
          >
            {/* Overlay Header */}
            <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
              <div>
                <h3 className="text-xl font-black text-neutral-dark tracking-tight">Location</h3>
              </div>
              <button
                onClick={() => setIsFullMapOpen(false)}
                className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-neutral-dark hover:bg-gray-100 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Overlay Map Container */}
            <div className="flex-1 relative">
              <MapContainer 
                center={position} 
                zoom={16} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} />
                <ChangeView center={position} />
              </MapContainer>

              {/* Coordinates Info Overlay in Full Screen */}
              {lat && lng && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[400] w-[90%] max-w-md">
                   <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20 flex gap-6">
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Latitude</p>
                        <p className="text-base font-black text-neutral-dark">{lat.toFixed(6)}</p>
                      </div>
                      <div className="w-[1px] h-10 bg-gray-200/50" />
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Longitude</p>
                        <p className="text-base font-black text-neutral-dark">{lng.toFixed(6)}</p>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {lat && lng && (
        <div className="flex gap-4 items-center px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex-1">
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Latitude</p>
            <p className="text-[11px] font-black text-neutral-dark">{lat.toFixed(6)}</p>
          </div>
          <div className="w-[1px] h-6 bg-gray-200" />
          <div className="flex-1">
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Longitude</p>
            <p className="text-[11px] font-black text-neutral-dark">{lng.toFixed(6)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
