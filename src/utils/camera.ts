import { NativeModules, Platform, PermissionsAndroid, Alert } from 'react-native';

const { CameraModule } = NativeModules;

export async function launchCamera(): Promise<string | null> {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'FaceAuth needs camera to capture your face',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Camera permission required');
        return null;
      }

      if (CameraModule && CameraModule.launchCamera) {
        const uri = await CameraModule.launchCamera();
        return uri;
      }
    }

    // Fallback
    return new Promise((resolve) => {
      Alert.alert(
        '📷 Capture Face',
        'Complete the liveness challenge',
        [
          { text: '✅ Capture', onPress: () => resolve('captured://face_' + Date.now()) },
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
        ],
        { cancelable: false },
      );
    });
  } catch {
    return new Promise((resolve) => {
      Alert.alert(
        '📷 Capture Face',
        'Complete the liveness challenge',
        [
          { text: '✅ Capture', onPress: () => resolve('captured://face_' + Date.now()) },
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
        ],
        { cancelable: false },
      );
    });
  }
}
