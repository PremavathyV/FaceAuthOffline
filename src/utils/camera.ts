/**
 * Camera utility using react-native-image-picker
 * Opens real device camera — no extra permissions setup needed
 */
import { launchCamera as rnLaunchCamera } from 'react-native-image-picker';

export async function launchCamera(): Promise<string | null> {
  return new Promise((resolve) => {
    rnLaunchCamera(
      {
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.8,
        saveToPhotos: false,
      },
      (response) => {
        if (response.didCancel || response.errorCode) {
          resolve(null);
        } else {
          const uri = response.assets?.[0]?.uri ?? null;
          resolve(uri);
        }
      },
    );
  });
}
