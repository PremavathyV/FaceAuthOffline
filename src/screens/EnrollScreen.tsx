import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Screen } from '../App';
import { LivenessDetector, LivenessChallenge } from '../services/livenessDetector';
import { DatabaseService } from '../services/database';

type Props = { navigate: (s: Screen, params?: any) => void };

export default function EnrollScreen({ navigate }: Props) {
  const [userId, setUserId]       = useState('');
  const [userName, setUserName]   = useState('');
  const [challenge, setChallenge] = useState<LivenessChallenge | null>(null);
  const [step, setStep]           = useState<'form' | 'liveness'>('form');
  const [processing, setProcessing] = useState(false);

  const startEnrollment = () => {
    if (!userId.trim() || !userName.trim()) {
      Alert.alert('Error', 'Please enter Employee ID and Name');
      return;
    }
    setChallenge(LivenessDetector.getRandomChallenge());
    setStep('liveness');
  };

  const captureAndEnroll = async () => {
    setProcessing(true);
    try {
      // Generate mock embedding (replace with TFLite inference in production)
      const raw = Array.from({ length: 128 }, () => Math.random() - 0.5);
      const norm = Math.sqrt(raw.reduce((s, v) => s + v * v, 0));
      const embedding = raw.map(v => v / norm);

      await DatabaseService.saveUser({
        id: userId.trim(),
        name: userName.trim(),
        embedding,
        enrolledAt: Date.now(),
        synced: false,
      });
      navigate('Result', { success: true, userId: userId.trim(), message: `${userName} enrolled successfully!` });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Enrollment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (step === 'form') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Enroll User</Text>
        <TextInput style={styles.input} placeholder="Employee ID" placeholderTextColor="#64748b"
          value={userId} onChangeText={setUserId} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#64748b"
          value={userName} onChangeText={setUserName} />
        <TouchableOpacity style={styles.btn} onPress={startEnrollment}>
          <Text style={styles.btnText}>Start Enrollment →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.back} onPress={() => navigate('Home')}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liveness Check</Text>
      <View style={styles.faceBox}>
        <Text style={styles.faceIcon}>👤</Text>
      </View>
      {challenge && (
        <View style={styles.challengeBox}>
          <Text style={styles.challengeText}>{challenge.instruction}</Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.btn, processing && styles.btnDisabled]}
        disabled={processing}
        onPress={captureAndEnroll}
      >
        <Text style={styles.btnText}>{processing ? 'Processing…' : '📸 Capture & Enroll'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.back} onPress={() => setStep('form')}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#0f172a', padding: 24, justifyContent: 'center' },
  title:         { fontSize: 28, fontWeight: '700', color: '#f8fafc', marginBottom: 32, textAlign: 'center' },
  input:         { backgroundColor: '#1e293b', color: '#f8fafc', padding: 14, borderRadius: 10, marginBottom: 16, fontSize: 16 },
  btn:           { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnDisabled:   { opacity: 0.5 },
  btnText:       { color: '#fff', fontSize: 16, fontWeight: '600' },
  back:          { marginTop: 16, alignItems: 'center' },
  backText:      { color: '#94a3b8', fontSize: 14 },
  faceBox:       { backgroundColor: '#1e293b', borderRadius: 120, width: 200, height: 200, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 3, borderColor: '#3b82f6' },
  faceIcon:      { fontSize: 80 },
  challengeBox:  { backgroundColor: '#1e3a5f', padding: 16, borderRadius: 12, marginBottom: 24, alignItems: 'center' },
  challengeText: { color: '#fbbf24', fontSize: 18, fontWeight: '700', textAlign: 'center' },
});
