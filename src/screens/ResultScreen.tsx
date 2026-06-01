import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen, ResultParams } from '../App';

type Props = { navigate: (s: Screen) => void; params: ResultParams };

export default function ResultScreen({ navigate, params }: Props) {
  const { success, message, userId } = params;
  return (
    <View style={[styles.container, success ? styles.success : styles.failure]}>
      <Text style={styles.icon}>{success ? '✅' : '❌'}</Text>
      <Text style={styles.status}>{success ? 'Authenticated' : 'Access Denied'}</Text>
      <Text style={styles.message}>{message}</Text>
      {userId && <Text style={styles.userId}>ID: {userId}</Text>}
      <TouchableOpacity style={styles.btn} onPress={() => navigate('Home')}>
        <Text style={styles.btnText}>Back to Home</Text>
      </TouchableOpacity>
      {success && (
        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigate('Auth')}>
          <Text style={styles.btnText}>Authenticate Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  success:     { backgroundColor: '#052e16' },
  failure:     { backgroundColor: '#1c0a0a' },
  icon:        { fontSize: 72, marginBottom: 16 },
  status:      { fontSize: 28, fontWeight: '700', color: '#f8fafc', marginBottom: 12 },
  message:     { fontSize: 16, color: '#cbd5e1', textAlign: 'center', marginBottom: 8 },
  userId:      { fontSize: 13, color: '#64748b', marginBottom: 32 },
  btn:         { width: '100%', backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnSecondary:{ width: '100%', backgroundColor: '#1e3a5f', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '600' },
});
