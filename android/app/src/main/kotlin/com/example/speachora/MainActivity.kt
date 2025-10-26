package com.example.speachora

import android.content.Intent
import android.speech.tts.TextToSpeech
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
	private val CHANNEL = "com.book8/tts"

	override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
		super.configureFlutterEngine(flutterEngine)

		MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
			if (call.method == "installTtsData") {
				try {
					val intent = Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA)
					intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
					startActivity(intent)
					result.success(null)
				} catch (e: Exception) {
					result.error("ERROR", "Failed to open TTS installer: ${e.message}", null)
				}
			} else {
				result.notImplemented()
			}
		}
	}
}
