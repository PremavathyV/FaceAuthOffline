# Model Assets — Downloaded & Ready

| File                    | Size   | Purpose                                      | Source                        |
|-------------------------|--------|----------------------------------------------|-------------------------------|
| mobilefacenet.tflite    | ~5 MB  | 128-d face embedding extraction              | MCarlomagno/FaceRecognitionAuth (MIT) |
| face_detector.tflite    | ~0.2 MB| BlazeFace — fast face detection              | Google MediaPipe (Apache 2.0) |
| face_landmarker.task    | ~3.6 MB| 478 facial landmarks for liveness detection  | Google MediaPipe (Apache 2.0) |
| **Total**               | **~9 MB** | Well under 20MB target                    |                               |

## Model Details

### mobilefacenet.tflite
- Input:  112×112×3 RGB, normalized [-1, 1]
- Output: 128-d float32 embedding vector
- Matching: Cosine similarity, threshold 0.65

### face_detector.tflite (BlazeFace short-range)
- Input:  128×128×3
- Output: bounding boxes + confidence scores
- Used for: face presence check before embedding

### face_landmarker.task (MediaPipe)
- Output: 478 3D landmarks per face
- Used for: liveness challenge verification
  - Blink  → Eye Aspect Ratio (EAR) < 0.25
  - Smile  → Mouth Aspect Ratio (MAR) > 0.45
  - Turn   → Head yaw from nose/cheek landmarks
