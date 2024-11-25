import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface YandexMapProps {
  onAddressSelect?: (address: string, coordinates: [number, number]) => void;
  initialAddress?: string;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  className?: string;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export const YandexMap: React.FC<YandexMapProps> = ({
  onAddressSelect,
  initialAddress,
  expanded = false,
  onExpandChange,
  className,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchValue, setSearchValue] = useState(initialAddress || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  // Load Yandex Maps script
  useEffect(() => {
    if (window.ymaps) {
      window.ymaps.ready(() => setIsLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://api-maps.yandex.ru/2.1/?apikey=YOUR_API_KEY&lang=ru_RU";
    script.async = true;
    script.onload = () => {
      window.ymaps.ready(() => setIsLoaded(true));
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Create map instance
    mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
      center: [55.76, 37.64], // Moscow coordinates
      zoom: 10,
      controls: ["zoomControl", "geolocationControl"],
    });

    // Create search control
    searchRef.current = new window.ymaps.control.SearchControl({
      options: {
        float: "right",
        floatIndex: 100,
        noPlacemark: true,
        provider: "yandex#search",
        resultsPerPage: 5,
      },
    });

    mapInstanceRef.current.controls.add(searchRef.current);

    // Add click handler for map
    mapInstanceRef.current.events.add("click", (e: any) => {
      const coords = e.get("coords");
      updateSelectedLocation(coords);
    });

    // Set initial address if provided
    if (initialAddress) {
      searchAddress(initialAddress);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, [isLoaded, initialAddress]);

  // Search for address
  const searchAddress = async (query: string) => {
    if (!isLoaded || !query) return;

    try {
      const response = await window.ymaps.geocode(query);
      const results = response.geoObjects.toArray();
      setSuggestions(
        results.map((result: any) => ({
          address: result.getAddressLine(),
          coords: result.geometry.getCoordinates(),
        })),
      );
    } catch (error) {
      console.error("Failed to search address:", error);
    }
  };

  // Update selected location
  const updateSelectedLocation = async (coords: [number, number]) => {
    if (!isLoaded) return;

    // Remove previous marker
    if (selectedMarker) {
      mapInstanceRef.current.geoObjects.remove(selectedMarker);
    }

    // Create new marker
    const marker = new window.ymaps.Placemark(
      coords,
      {},
      {
        preset: "islands#redDotIcon",
        draggable: true,
      },
    );

    // Add marker to map
    mapInstanceRef.current.geoObjects.add(marker);
    setSelectedMarker(marker);

    // Get address for coordinates
    try {
      const response = await window.ymaps.geocode(coords);
      const firstResult = response.geoObjects.get(0);
      const address = firstResult.getAddressLine();
      setSearchValue(address);
      onAddressSelect?.(address, coords);
    } catch (error) {
      console.error("Failed to get address:", error);
    }

    // Center map on selected location
    mapInstanceRef.current.setCenter(coords, mapInstanceRef.current.getZoom());
  };

  const handleSuggestionSelect = (suggestion: any) => {
    updateSelectedLocation(suggestion.coords);
    setSuggestions([]);
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-lg border overflow-hidden",
        expanded ? "fixed inset-4 z-50" : "h-[300px]",
        className,
      )}
      layout
    >
      {/* Search Input */}
      <div className="absolute top-4 left-4 right-4 z-10 bg-white rounded-lg shadow-lg">
        <div className="relative">
          <Input
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              searchAddress(e.target.value);
            }}
            placeholder="Введите адрес..."
            className="pr-10"
          />
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg overflow-hidden"
            >
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  whileHover={{ backgroundColor: "rgb(249, 250, 251)" }}
                  whileTap={{ backgroundColor: "rgb(243, 244, 246)" }}
                >
                  {suggestion.address}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expand/Collapse Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 z-10 bg-white"
        onClick={() => onExpandChange?.(!expanded)}
      >
        {expanded ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ background: "#f7f7f7" }}
      />

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      )}
    </motion.div>
  );
};

export default YandexMap;
