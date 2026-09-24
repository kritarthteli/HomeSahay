import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { BENGALURU_CENTER } from '../data/seedData';
import { Colors } from '../constants/theme';

const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#121214"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#121214"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];

export default function MapViewNative({ workers = [], customerLocation, radiusKm = 5, style }) {
  const center = customerLocation ?? BENGALURU_CENTER;

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={[styles.map, style, { backgroundColor: Colors.canvasDark }]}
      initialRegion={{
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      mapType="standard"
      userInterfaceStyle="dark"
      customMapStyle={Platform.OS === 'android' ? darkMapStyle : undefined}
    >
      {/* Customer location */}
      <Marker
        coordinate={center}
        pinColor={Colors.customerAccent}
        title="Your Location"
        description="JP Nagar, Bengaluru"
      />

      {/* Search radius circle */}
      <Circle
        center={center}
        radius={radiusKm * 1000}
        fillColor="rgba(108, 99, 255, 0.08)"
        strokeColor="rgba(108, 99, 255, 0.3)"
        strokeWidth={1.5}
      />

      {/* Worker markers */}
      {workers.map((w) => (
        <Marker
          key={w.id}
          coordinate={w.location}
          pinColor={w.isOnline ? Colors.workerPin : Colors.bg4}
          title={w.name}
          description={`${w.category} • ⭐ ${w.rating} • ETA ~${w.etaMinutes ?? w.estimatedEta} min`}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
