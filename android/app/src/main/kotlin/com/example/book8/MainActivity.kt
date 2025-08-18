package com.example.book8

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
	private val CHANNEL = "com.book8/app"

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)

		try {
			val action = intent?.action
			val categories = intent?.categories
			if (action == Intent.ACTION_MAIN && categories != null && categories.contains(Intent.CATEGORY_HOME)) {
				val prefs = getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
				// shared_preferences prefixes keys with "flutter."
				val isDefault = prefs.getBoolean("flutter.isDefaultLauncher", false)
				if (!isDefault) {
					// Not allowed to act as launcher - finish immediately so system uses other launcher
					finish()
					return
				}
			}
		} catch (e: Exception) {
			e.printStackTrace()
		}
	}

	override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
		super.configureFlutterEngine(flutterEngine)

		MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
			when (call.method) {
				"openHomeSettings" -> {
					try {
						val intent = Intent(Settings.ACTION_HOME_SETTINGS)
						intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
						startActivity(intent)
						result.success(true)
					} catch (e: Exception) {
						result.error("ERROR", "Failed to open home settings: ${e.message}", null)
					}
				}
				else -> result.notImplemented()
			}
		}
	}
}
