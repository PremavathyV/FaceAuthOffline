import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import EnrollScreen from './screens/EnrollScreen';
import AuthScreen from './screens/AuthScreen';
import ResultScreen from './screens/ResultScreen';

export type Screen = 'Home' | 'Enroll' | 'Auth' | 'Result';
export type ResultParams = { success: boolean; userId?: string; message: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>('Home');
  const [resultParams, setResultParams] = useState<ResultParams>({ success: false, message: '' });

  const navigate = (s: Screen, params?: ResultParams) => {
    if (params) setResultParams(params);
    setScreen(s);
  };

  return (
    <View style={styles.root}>
      {screen === 'Home'   && <HomeScreen   navigate={navigate} />}
      {screen === 'Enroll' && <EnrollScreen navigate={navigate} />}
      {screen === 'Auth'   && <AuthScreen   navigate={navigate} />}
      {screen === 'Result' && <ResultScreen navigate={navigate} params={resultParams} />}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
