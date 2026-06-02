import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Easing,
} from 'react-native';
import { Screen, ResultParams } from '../App';

type Props = { navigate: (s: Screen) => void; params: ResultParams };

export default function ResultScreen({ navigate, params }: Props) {
  const { success, message, userId, userName, timestamp } = params as any;

  const scaleAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const timeStr = timestamp
    ? new Date(timestamp).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      })
    : new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      });

  return (
    <View style={[styles.container, success ? styles.successBg : styles.failBg]}>

      {/* Animated icon */}
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.icon}>{success ? '✅' : '❌'}</Text>
      </Animated.View>

      {/* Status */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <Text style={[styles.status, success ? styles.successText : styles.failText]}>
          {success ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
        </Text>

        {success && userId ? (
          <View style={styles.card}>
            {/* User info card */}
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>👤  Name</Text>
              <Text style={styles.cardValue}>{userName ?? 'Unknown'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>🪪  Employee ID</Text>
              <Text style={styles.cardValue}>{userId}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>🕐  Time</Text>
              <Text style={styles.cardValue}>{timeStr}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>🔒  Auth Method</Text>
              <Text style={styles.cardValue}>Face + Liveness</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>📡  Status</Text>
              <Text style={[styles.cardValue, styles.syncPending]}>⏳ Pending Sync</Text>
            </View>
          </View>
        ) : (
          <View style={styles.failCard}>
            <Text style={styles.failMessage}>{message}</Text>
          </View>
        )}

        {/* Buttons */}
        <TouchableOpacity style={styles.btnHome} onPress={() => navigate('Home')}>
          <Text style={styles.btnText}>🏠  Back to Home</Text>
        </TouchableOpacity>

        {success && (
          <TouchableOpacity style={styles.btnAgain} onPress={() => navigate('Auth')}>
            <Text style={styles.btnText}>🔄  Authenticate Again</Text>
          </TouchableOpacity>
        )}

        {!success && (
          <TouchableOpacity style={styles.btnRetry} onPress={() => navigate('Auth')}>
            <Text style={styles.btnText}>🔁  Try Again</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successBg:   { backgroundColor: '#020d06' },
  failBg:      { backgroundColor: '#0d0202' },
  iconWrap:    { marginBottom: 20 },
  icon:        { fontSize: 80 },
  status:      { fontSize: 22, fontWeight: '900', letterSpacing: 3, textAlign: 'center', marginBottom: 24 },
  successText: { color: '#4ade80' },
  failText:    { color: '#f87171' },

  card:        { backgroundColor: '#0f172a', borderRadius: 16, padding: 20, width: '100%', borderWidth: 1, borderColor: '#1e3a5f', marginBottom: 24 },
  cardRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  cardLabel:   { color: '#64748b', fontSize: 13, fontWeight: '500' },
  cardValue:   { color: '#f1f5f9', fontSize: 14, fontWeight: '700', maxWidth: '55%', textAlign: 'right' },
  divider:     { height: 1, backgroundColor: '#1e293b' },
  syncPending: { color: '#fbbf24' },

  failCard:    { backgroundColor: '#1c0505', borderRadius: 16, padding: 20, width: '100%', borderWidth: 1, borderColor: '#7f1d1d', marginBottom: 24, alignItems: 'center' },
  failMessage: { color: '#fca5a5', fontSize: 15, textAlign: 'center', lineHeight: 22 },

  btnHome:     { backgroundColor: '#1d4ed8', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, width: '100%' },
  btnAgain:    { backgroundColor: '#064e3b', padding: 16, borderRadius: 12, alignItems: 'center', width: '100%' },
  btnRetry:    { backgroundColor: '#7f1d1d', padding: 16, borderRadius: 12, alignItems: 'center', width: '100%' },
  btnText:     { color: '#fff', fontSize: 15, fontWeight: '700' },
});
