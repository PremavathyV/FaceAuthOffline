import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen } from '../App';
import { LivenessDetector, LivenessChallenge } from '../services/livenessDetector';
import { FaceRecognitionService } from '../services/faceRecognition';
import { DatabaseService } from '../services/database';

type Props = { navigate: (s: Screen, params?: any) => void };

export default function AuthScreen({ navigate }: Props) {
  const [challenge, setChallenge]   = useState<LivenessChallenge | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { setChallenge(LivenessDetector.getRandomChallenge()); }, []);

  const authenticate = async () => {
    setProcessing(true);
    try {
      const allUsers = await DatabaseService.getAllUsers();
      if (allUsers.length === 0) {
        navigate('Result', { success: false, message: 'No users enrolled. Please enroll first.' });
        return;
      }
      // Mock query embedding (replace with TFLite in production)
      const raw = Array.from({ length: 128 }, () => Math.random() - 0.5);
      const norm = Math.sqrt(raw.reduce((s, v) => s + v * v, 0));
      const query = raw.map(v => v / norm);

      const match = FaceRecognitionService.findBestMatch(query, allUsers);
      if (match) {
        await DatabaseService.logAttendance({ userId: match.id, timestamp: Date.now(), synced: false });
        navigate('Result', { success: true, userId: match.id, message: `Welcome, ${match.name}!` });
      } else {
        navigate('Result', { success: false, message: 'Face not recognized. Access denied.' });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authenticate</Text>
      <View style={styles.faceBox}>
        <Text style={styles.faceIcon}>👤</Text>
        <Text style={styles.faceHint}>Position your face</Text>
      </View>
      {challenge && (
        <View style={styles.challengeBox}>
          <Text style={styles.challengeText}>{challenge.instruction}</Text>
        </View>
      )}
      <TouchableOpacity style={[styles.btn, processing && styles.btnDisabled]} disabled={processing} onPress={authenticate}>
        <Text style={styles.btnText}>{processing ? 'Verifying…' : '🔍 Verify Identity'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.back} onPress={() => navigate('Home')}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#0f172a', padding: 24, justifyContent: 'center' },
  title:         { fontSize: 28, fontWeight: '700', color: '#f8fafc', marginBottom: 32, textAlign: 'center' },
  faceBox:       { backgroundColor: '#1e293b', borderRadius: 120, width: 220, height: 220, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 3, borderColor: '#3b82f6', borderStyle: 'dashed' },
  faceIcon:      { fontSize: 80 },
  faceHint:      { color: '#64748b', fontSize: 12, marginTop: 8 },
  challengeBox:  { backgroundColor: '#1e3a5f', padding: 16, borderRadius: 12, marginBottom: 24, alignItems: 'center' },
  challengeText: { color: '#fbbf24', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  btn:           { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnDisabled:   { opacity: 0.5 },
  btnText:       { color: '#fff', fontSize: 16, fontWeight: '600' },
  back:          { marginTop: 16, alignItems: 'center' },
  backText:      { color: '#94a3b8', fontSize: 14 },
});
