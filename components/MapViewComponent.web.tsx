import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { BENGALURU_CENTER } from '../data/seedData';
import { Colors } from '../constants/theme';

export default function MapViewWeb({ workers = [], customerLocation, style }) {
  const center = customerLocation ?? BENGALURU_CENTER;

  const workerMarkersJs = workers
    .map((w) => {
      const color = w.isOnline ? '#22C55E' : '#64748B';
      return `
        L.circleMarker([${w.location.latitude}, ${w.location.longitude}], {
          radius: 10,
          fillColor: '${color}',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map).bindPopup('<b>${w.name}</b><br>${w.category}<br>⭐ ${w.rating}<br>ETA: ~${w.etaMinutes} min');
      `;
    })
    .join('\n');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #0F172A; }
    .leaflet-popup-content-wrapper { background: #1E293B; color: #F1F5F9; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }
    .leaflet-popup-tip { background: #1E293B; }
    .leaflet-tile { filter: brightness(0.8) saturate(0.7) hue-rotate(200deg); }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  const map = L.map('map', { zoomControl: true }).setView([${center.latitude}, ${center.longitude}], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(map);

  // Customer location marker
  const customerIcon = L.divIcon({
    className: '',
    html: '<div style="width:16px;height:16px;background:#6C63FF;border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px #6C63FF88;"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
  L.marker([${center.latitude}, ${center.longitude}], { icon: customerIcon })
    .addTo(map)
    .bindPopup('<b>📍 Your Location</b><br>JP Nagar, Bengaluru');

  // Worker markers
  ${workerMarkersJs}
</script>
</body>
</html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', borderRadius: 0 },
  webview: { flex: 1, backgroundColor: Colors.bg1 },
});
