import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Screen } from '../App';
import { initDatabase } from '../services/database';

type Props = { navigate: (s: Screen) => void };

export default function HomeScreen({ navigate }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDatabase().then(() => setReady(true));
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <Text style={styles.title}>FaceAuth Offline</Text>
      <Text style={styles.subtitle}>SECURE  •  OFFLINE  •  LIGHTWEIGHT</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>🤖 MobileFaceNet  •  🔒 Offline  •  ⚡ &lt;1s</Text>
      </View>
      <TouchableOpacity
        style={[styles.btn, !ready && styles.btnDisabled]}
        disabled={!ready}
        onPress={() => navigate('Enroll')}
      >
        <Text style={styles.btnText}>👤  Enroll New User</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.btnSecondary, !ready && styles.btnDisabled]}
        disabled={!ready}
        onPress={() => navigate('Auth')}
      >
        <Text style={styles.btnText}>🔍  Authenticate</Text>
      </TouchableOpacity>
      {!ready && <Text style={styles.loading}>Initializing…</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title:        { fontSize: 34, fontWeight: '800', color: '#f8fafc', marginBottom: 8 },
  subtitle:     { fontSize: 12, color: '#64748b', letterSpacing: 3, marginBottom: 32 },
  badge:        { backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 40 },
  badgeText:    { color: '#60a5fa', fontSize: 12 },
  btn:          { width: '100%', backgroundColor: '#3b82f6', padding: 18, borderRadius: 14, alignItems: 'center', marginBottom: 14 },
  btnSecondary: { backgroundColor: '#1d4ed8' },
  btnDisabled:  { opacity: 0.4 },
  btnText:      { color: '#fff', fontSize: 17, fontWeight: '700' },
  loading:      { color: '#64748b', marginTop: 16, fontSize: 13 },
});
