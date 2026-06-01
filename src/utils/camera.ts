import { NativeModules, Platform, PermissionsAndroid, Alert } from 'react-native';

export async function launchCamera(): Promise<string | null> {
  try {
    if (Platform.OS === 'android') {
      // Request camera permission
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'FaceAuth needs camera access to capture your face',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Camera permission is required');
        return null;
      }
    }

    // Use React Native's built-in camera via ActionSheet simulation
    return new Promise((resolve) => {
      Alert.alert(
        '📷 Face Capture',
        'Complete the liveness challenge and capture your face',
        [
          {
            text: '✅ Capture',
            onPress: () => resolve('captured://face_' + Date.now()),
          },
          {
            text: '❌ Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ],
        { cancelable: false },
      );
    });
  } catch (e) {
    return null;
  }
}
