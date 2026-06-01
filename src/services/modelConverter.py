"""
Model conversion scripts for Hackathon 7.0
Converts trained models to INT8 quantized TFLite for on-device inference.

Requirements:
    pip install tensorflow==2.13.0 numpy pillow

Usage:
    python modelConverter.py --model mobilefacenet --input_path ./models/mobilefacenet.h5
    python modelConverter.py --model liveness    --input_path ./models/liveness_model.h5
"""

import argparse
import numpy as np
import tensorflow as tf
from pathlib import Path


def representative_dataset_gen(image_dir: str, input_shape: tuple, n_samples: int = 200):
    """Yields representative samples for INT8 calibration."""
    from PIL import Image
    import os
    files = list(Path(image_dir).glob("**/*.jpg"))[:n_samples]
    for f in files:
        img = Image.open(f).convert("RGB").resize(input_shape[:2])
        arr = np.array(img, dtype=np.float32)
        arr = arr / 127.5 - 1.0  # normalize to [-1, 1]
        yield [arr[np.newaxis, ...]]


def convert_mobilefacenet(input_path: str, output_path: str, calib_dir: str):
    model = tf.keras.models.load_model(input_path)
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.representative_dataset = lambda: representative_dataset_gen(calib_dir, (112, 112, 3))
    converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
    converter.inference_input_type = tf.int8
    converter.inference_output_type = tf.float32  # keep output as float for cosine sim
    tflite_model = converter.convert()
    Path(output_path).write_bytes(tflite_model)
    size_mb = len(tflite_model) / (1024 * 1024)
    print(f"MobileFaceNet TFLite saved: {output_path} ({size_mb:.2f} MB)")


def convert_liveness(input_path: str, output_path: str, calib_dir: str):
    model = tf.keras.models.load_model(input_path)
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]

    def liveness_calib():
        from PIL import Image
        files = list(Path(calib_dir).glob("**/*.jpg"))[:200]
        for f in files:
            img = Image.open(f).convert("RGB").resize((64, 64))
            arr = np.array(img, dtype=np.float32) / 255.0
            yield [arr[np.newaxis, ...]]

    converter.representative_dataset = liveness_calib
    converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
    converter.inference_input_type = tf.uint8
    converter.inference_output_type = tf.float32
    tflite_model = converter.convert()
    Path(output_path).write_bytes(tflite_model)
    size_mb = len(tflite_model) / (1024 * 1024)
    print(f"Liveness TFLite saved: {output_path} ({size_mb:.2f} MB)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", choices=["mobilefacenet", "liveness"], required=True)
    parser.add_argument("--input_path", required=True)
    parser.add_argument("--output_path", default=None)
    parser.add_argument("--calib_dir", default="./calibration_data")
    args = parser.parse_args()

    out = args.output_path or args.input_path.replace(".h5", ".tflite")

    if args.model == "mobilefacenet":
        convert_mobilefacenet(args.input_path, out, args.calib_dir)
    else:
        convert_liveness(args.input_path, out, args.calib_dir)
