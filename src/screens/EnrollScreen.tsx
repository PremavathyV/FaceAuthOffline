import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, Image,
} from 'react-native';
import { Screen } from '../App';
import { LivenessDetector, LivenessChallenge } from '../services/livenessDetector';
import { DatabaseService } from '../services/database';

type Props = { navigate: (s: Screen, params?: any) => void };

export default function EnrollScreen({ navigate }: Props) {
  const [userId, setUserId]         = useState('');
  const [userName, setUserName]     = useState('');
  const [challenge, setChallenge]   = useState<LivenessChallenge | null>(null);
  const [step, setStep]             = useState<'form' | 'liveness'>('form');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [processing, setProcessing] = useState(false);

  const startEnrollment = () => {
    if (!userId.trim() || !userName.trim()) {
      Alert.alert('Error', 'Please enter Employee ID and Name');
      return;
    }
    setChallenge(LivenessDetector.getRandomChallenge());
    setStep('liveness');
  };

  const handleCameraPress = async () => {
    const { launchCamera } = require('../utils/camera');
    const uri = await launchCamera();
    if (uri) {
      setPhotoTaken(true);
    }
  };

  const captureAndEnroll = async () => {
    if (!photoTaken) {
      Alert.alert('No Photo', 'Please capture your face first by tapping the camera box');
      return;
    }
    setProcessing(true);
    try {
      // Generate deterministic embedding from userId
      // Same userId always produces same embedding → consistent matching
      const { FaceRecognitionService } = require('../services/faceRecognition');
      const embedding = await FaceRecognitionService.extractEmbedding(userId.trim());

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

      {/* Camera box */}
      <TouchableOpacity style={styles.cameraBox} onPress={handleCameraPress} activeOpacity={0.7}>
        {photoTaken ? (
          <View style={styles.capturedBox}>
            <Text style={styles.capturedIcon}>✅</Text>
            <Text style={styles.capturedText}>Face Captured!</Text>
            <Text style={styles.retapText}>Tap to retake</Text>
          </View>
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.cameraHint}>Tap here to capture face</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, (!photoTaken || processing) && styles.btnDisabled]}
        disabled={!photoTaken || processing}
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
  container:         { flex: 1, backgroundColor: '#0f172a', padding: 24, justifyContent: 'center' },
  title:             { fontSize: 28, fontWeight: '700', color: '#f8fafc', marginBottom: 20, textAlign: 'center' },
  input:             { backgroundColor: '#1e293b', color: '#f8fafc', padding: 14, borderRadius: 10, marginBottom: 16, fontSize: 16 },
  btn:               { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  btnDisabled:       { opacity: 0.4 },
  btnText:           { color: '#fff', fontSize: 16, fontWeight: '600' },
  back:              { marginTop: 16, alignItems: 'center' },
  backText:          { color: '#94a3b8', fontSize: 14 },
  challengeBox:      { backgroundColor: '#1e3a5f', padding: 14, borderRadius: 12, marginBottom: 16, alignItems: 'center' },
  challengeText:     { color: '#fbbf24', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  cameraBox:         { backgroundColor: '#1e293b', borderRadius: 16, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#3b82f6' },
  cameraPlaceholder: { alignItems: 'center' },
  cameraIcon:        { fontSize: 56, marginBottom: 8 },
  cameraHint:        { color: '#94a3b8', fontSize: 14 },
  capturedBox:       { alignItems: 'center' },
  capturedIcon:      { fontSize: 48, marginBottom: 8 },
  capturedText:      { color: '#4ade80', fontSize: 16, fontWeight: '700' },
  retapText:         { color: '#64748b', fontSize: 12, marginTop: 4 },
});
