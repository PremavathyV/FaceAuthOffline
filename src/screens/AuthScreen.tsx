import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { launchCamera } from '../utils/camera';
import { Screen } from '../App';
import { LivenessDetector, LivenessChallenge } from '../services/livenessDetector';
import { FaceRecognitionService } from '../services/faceRecognition';
import { DatabaseService } from '../services/database';

type Props = { navigate: (s: Screen, params?: any) => void };

export default function AuthScreen({ navigate }: Props) {
  const [challenge, setChallenge]   = useState<LivenessChallenge | null>(null);
  const [photoUri, setPhotoUri]     = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setChallenge(LivenessDetector.getRandomChallenge());
  }, []);

  const openCamera = async () => {
    const uri = await launchCamera();
    if (uri) setPhotoUri(uri);
  };

  const authenticate = async () => {
    if (!photoUri) return;
    setProcessing(true);
    try {
      const allUsers = await DatabaseService.getAllUsers();
      if (allUsers.length === 0) {
        navigate('Result', { success: false, message: 'No users enrolled. Please enroll first.' });
        return;
      }

      // TODO: replace with TFLite MobileFaceNet inference on photoUri
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

      {challenge && (
        <View style={styles.challengeBox}>
          <Text style={styles.challengeText}>{challenge.instruction}</Text>
        </View>
      )}

      {/* Camera box */}
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
        onPress={authenticate}
      >
        <Text style={styles.btnText}>
          {processing ? 'Verifying…' : '🔍 Verify Identity'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.back} onPress={() => navigate('Home')}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#0f172a', padding: 24, justifyContent: 'center' },
  title:             { fontSize: 28, fontWeight: '700', color: '#f8fafc', marginBottom: 20, textAlign: 'center' },
  challengeBox:      { backgroundColor: '#1e3a5f', padding: 14, borderRadius: 12, marginBottom: 16, alignItems: 'center' },
  challengeText:     { color: '#fbbf24', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  cameraBox:         { backgroundColor: '#1e293b', borderRadius: 16, height: 240, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#3b82f6', borderStyle: 'dashed', overflow: 'hidden' },
  cameraPlaceholder: { alignItems: 'center' },
  cameraIcon:        { fontSize: 64, marginBottom: 8 },
  cameraHint:        { color: '#64748b', fontSize: 13 },
  photo:             { width: '100%', height: '100%', resizeMode: 'cover' },
  retake:            { alignItems: 'center', marginBottom: 4 },
  retakeText:        { color: '#60a5fa', fontSize: 13 },
  btn:               { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  btnDisabled:       { opacity: 0.4 },
  btnText:           { color: '#fff', fontSize: 16, fontWeight: '600' },
  back:              { marginTop: 16, alignItems: 'center' },
  backText:          { color: '#94a3b8', fontSize: 14 },
});
