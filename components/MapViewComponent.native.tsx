import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { BENGALURU_CENTER } from '../data/seedData';
import { Colors } from '../constants/theme';

export default function MapViewNative({ workers = [], customerLocation, radiusKm = 5, style }) {
  const center = customerLocation ?? BENGALURU_CENTER;

  return (
    <MapView
      style={[styles.map, style]}
      initialRegion={{
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      mapType="standard"
      userInterfaceStyle="dark"
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
