import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, Image, Platform,
} from 'react-native';
import { launchCamera, launchImageLibrary } from '../utils/camera';
import { Screen } from '../App';
import { LivenessDetector, LivenessChallenge } from '../services/livenessDetector';
import { DatabaseService } from '../services/database';

type Props = { navigate: (s: Screen, params?: any) => void };

export default function EnrollScreen({ navigate }: Props) {
  const [userId, setUserId]         = useState('');
  const [userName, setUserName]     = useState('');
  const [challenge, setChallenge]   = useState<LivenessChallenge | null>(null);
  const [step, setStep]             = useState<'form' | 'liveness'>('form');
  const [photoUri, setPhotoUri]     = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const startEnrollment = () => {
    if (!userId.trim() || !userName.trim()) {
      Alert.alert('Error', 'Please enter Employee ID and Name');
      return;
    }
    setChallenge(LivenessDetector.getRandomChallenge());
    setStep('liveness');
  };

  const openCamera = async () => {
    const uri = await launchCamera();
    if (uri) setPhotoUri(uri);
  };

  const captureAndEnroll = async () => {
    if (!photoUri) {
      Alert.alert('No Photo', 'Please capture your photo first');
      return;
    }
    setProcessing(true);
    try {
      // Generate embedding from photo
      // TODO: replace with TFLite MobileFaceNet inference
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
      navigate('Result', {
        success: true,
        userId: userId.trim(),
        message: `${userName} enrolled successfully!`,
      });
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
        <TextInput
          style={styles.input}
          placeholder="Employee ID"
          placeholderTextColor="#64748b"
          value={userId}
          onChangeText={setUserId}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#64748b"
          value={userName}
          onChangeText={setUserName}
        />
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

      {challenge && (
        <View style={styles.challengeBox}>
          <Text style={styles.challengeText}>{challenge.instruction}</Text>
        </View>
      )}

      {/* Camera preview / captured photo */}
      <TouchableOpacity style={styles.cameraBox} onPress={openCamera}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.cameraHint}>Tap to open camera</Text>
          </View>
        )}
      </TouchableOpacity>

      {photoUri && (
        <TouchableOpacity style={styles.retake} onPress={openCamera}>
          <Text style={styles.retakeText}>🔄 Retake Photo</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.btn, (!photoUri || processing) && styles.btnDisabled]}
        disabled={!photoUri || processing}
        onPress={captureAndEnroll}
      >
        <Text style={styles.btnText}>
          {processing ? 'Processing…' : '✅ Enroll'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.back} onPress={() => setStep('form')}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#0f172a', padding: 24, justifyContent: 'center' },
  title:              { fontSize: 28, fontWeight: '700', color: '#f8fafc', marginBottom: 20, textAlign: 'center' },
  input:              { backgroundColor: '#1e293b', color: '#f8fafc', padding: 14, borderRadius: 10, marginBottom: 16, fontSize: 16 },
  btn:                { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  btnDisabled:        { opacity: 0.4 },
  btnText:            { color: '#fff', fontSize: 16, fontWeight: '600' },
  back:               { marginTop: 16, alignItems: 'center' },
  backText:           { color: '#94a3b8', fontSize: 14 },
  challengeBox:       { backgroundColor: '#1e3a5f', padding: 14, borderRadius: 12, marginBottom: 16, alignItems: 'center' },
  challengeText:      { color: '#fbbf24', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  cameraBox:          { backgroundColor: '#1e293b', borderRadius: 16, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#3b82f6', overflow: 'hidden' },
  cameraPlaceholder:  { alignItems: 'center' },
  cameraIcon:         { fontSize: 56, marginBottom: 8 },
  cameraHint:         { color: '#64748b', fontSize: 13 },
  photo:              { width: '100%', height: '100%', resizeMode: 'cover' },
  retake:             { alignItems: 'center', marginBottom: 4 },
  retakeText:         { color: '#60a5fa', fontSize: 13 },
});
