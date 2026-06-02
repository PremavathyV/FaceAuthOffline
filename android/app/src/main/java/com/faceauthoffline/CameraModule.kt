package com.faceauthoffline

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.provider.MediaStore
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class CameraModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var pendingPromise: Promise? = null
    private var photoFile: File? = null

    companion object {
        const val REQUEST_IMAGE_CAPTURE = 1001
    }

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName() = "CameraModule"

    @ReactMethod
    fun launchCamera(promise: Promise) {
        val activity = currentActivity ?: run {
            promise.reject("NO_ACTIVITY", "No activity")
            return
        }

        pendingPromise = promise

        try {
            val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
            val storageDir = reactContext.getExternalFilesDir(Environment.DIRECTORY_PICTURES)
            photoFile = File.createTempFile("FACE_${timeStamp}_", ".jpg", storageDir)

            val photoURI: Uri = FileProvider.getUriForFile(
                reactContext,
                "${reactContext.packageName}.fileprovider",
                photoFile!!
            )

            val takePictureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                putExtra(MediaStore.EXTRA_OUTPUT, photoURI)
                putExtra("android.intent.extras.CAMERA_FACING", 1) // front camera
            }

            activity.startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE)
        } catch (e: Exception) {
            promise.reject("CAMERA_ERROR", e.message)
        }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQUEST_IMAGE_CAPTURE) {
            if (resultCode == Activity.RESULT_OK && photoFile != null) {
                pendingPromise?.resolve("file://${photoFile!!.absolutePath}")
            } else {
                pendingPromise?.resolve(null)
            }
            pendingPromise = null
        }
    }

    override fun onNewIntent(intent: Intent?) {}
}
