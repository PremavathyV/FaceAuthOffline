package com.faceauthoffline

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import com.facebook.react.bridge.*
import org.tensorflow.lite.Interpreter
import java.io.FileInputStream
import java.io.InputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel
import kotlin.math.sqrt

class FaceRecognitionModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "FaceRecognitionModule"

    private var interpreter: Interpreter? = null

    private fun loadModel(): Interpreter {
        if (interpreter != null) return interpreter!!
        val assetManager = reactContext.assets
        val afd = assetManager.openFd("models/mobilefacenet.tflite")
        val inputStream = FileInputStream(afd.fileDescriptor)
        val fileChannel = inputStream.channel
        val startOffset = afd.startOffset
        val declaredLength = afd.declaredLength
        val modelBuffer: MappedByteBuffer = fileChannel.map(
            FileChannel.MapMode.READ_ONLY, startOffset, declaredLength
        )
        interpreter = Interpreter(modelBuffer)
        return interpreter!!
    }

    private fun preprocessBitmap(bitmap: Bitmap): ByteBuffer {
        val resized = Bitmap.createScaledBitmap(bitmap, 112, 112, true)
        val inputBuffer = ByteBuffer.allocateDirect(4 * 112 * 112 * 3)
        inputBuffer.order(ByteOrder.nativeOrder())
        val pixels = IntArray(112 * 112)
        resized.getPixels(pixels, 0, 112, 0, 0, 112, 112)
        for (pixel in pixels) {
            val r = ((pixel shr 16 and 0xFF) / 127.5f - 1.0f)
            val g = ((pixel shr 8  and 0xFF) / 127.5f - 1.0f)
            val b = ((pixel        and 0xFF) / 127.5f - 1.0f)
            inputBuffer.putFloat(r)
            inputBuffer.putFloat(g)
            inputBuffer.putFloat(b)
        }
        inputBuffer.rewind()
        return inputBuffer
    }

    private fun l2Normalize(embedding: FloatArray): FloatArray {
        val norm = sqrt(embedding.map { it * it }.sum())
        return if (norm > 1e-6f) embedding.map { it / norm }.toFloatArray() else embedding
    }

    @ReactMethod
    fun extractEmbedding(imagePath: String, promise: Promise) {
        try {
            val model = loadModel()

            // Load image
            val cleanPath = imagePath.replace("file://", "")
            val bitmap = BitmapFactory.decodeFile(cleanPath)
                ?: run {
                    promise.reject("DECODE_ERROR", "Cannot decode image: $imagePath")
                    return
                }

            val inputBuffer = preprocessBitmap(bitmap)

            // Get actual output shape from model
            val outputTensor = model.getOutputTensor(0)
            val outputShape = outputTensor.shape()
            val embeddingSize = outputShape[outputShape.size - 1]

            val outputBuffer = Array(1) { FloatArray(embeddingSize) }
            model.run(inputBuffer, outputBuffer)

            val embedding = l2Normalize(outputBuffer[0])

            val result = WritableNativeArray()
            embedding.forEach { result.pushDouble(it.toDouble()) }
            promise.resolve(result)

        } catch (e: Exception) {
            promise.reject("INFERENCE_ERROR", e.message ?: "Unknown error")
        }
    }

    @ReactMethod
    fun cosineSimilarity(embA: ReadableArray, embB: ReadableArray, promise: Promise) {
        try {
            var dot = 0.0
            for (i in 0 until embA.size()) {
                dot += embA.getDouble(i) * embB.getDouble(i)
            }
            promise.resolve(dot)
        } catch (e: Exception) {
            promise.reject("SIMILARITY_ERROR", e.message)
        }
    }
}
