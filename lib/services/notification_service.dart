import 'dart:convert';

import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'package:flutter/material.dart';

// -------------------- NOTIFICATION SERVICE --------------------
class NotificationService {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static Future<void> initialize() async {
    tz.initializeTimeZones();

    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosSettings =
        DarwinInitializationSettings();

    const InitializationSettings settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notificationsPlugin.initialize(settings);
  }

  static Future<void> showTestNotification() async {
    const AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
          'test_channel',
          'Test Notifications',
          channelDescription: 'Channel for test notifications',
          importance: Importance.max,
          priority: Priority.high,
          playSound: true,
          sound: RawResourceAndroidNotificationSound('alarm'),
        );

    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
      presentSound: true,
    );

    const NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notificationsPlugin.show(
      999,
      'Test Notification',
      'This is a test notification to verify the system is working!',
      details,
    );
  }
}

// -------------------- ALARM SERVICE --------------------
class AlarmService {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static Future<void> initialize() async {
    tz.initializeTimeZones();

    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosSettings =
        DarwinInitializationSettings();

    const InitializationSettings settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notificationsPlugin.initialize(settings);
  }

  static Future<void> scheduleAlarm(
    String alarmName,
    TimeOfDay time,
    int alarmId,
  ) async {
    final now = DateTime.now();
    final scheduledTime = DateTime(
      now.year,
      now.month,
      now.day,
      time.hour,
      time.minute,
    );

    final alarmTime =
        scheduledTime.isBefore(now)
            ? scheduledTime.add(const Duration(days: 1))
            : scheduledTime;

    final tzAlarmTime = tz.TZDateTime.from(alarmTime, tz.local);

    const AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
          'alarm_channel',
          'Alarms',
          channelDescription: 'Scheduled alarms',
          importance: Importance.max,
          priority: Priority.high,
          playSound: true,
          sound: RawResourceAndroidNotificationSound('alarm'),
          enableVibration: true,
        );

    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
      presentSound: true,
    );

    const NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notificationsPlugin.zonedSchedule(
      alarmId,
      'Alarm: $alarmName',
      'It\'s time for your $alarmName reminder!',
      tzAlarmTime,
      details,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      matchDateTimeComponents: DateTimeComponents.time,
    );
  }

  static Future<void> cancelAlarm(int alarmId) async {
    await _notificationsPlugin.cancel(alarmId);
  }

  static Future<void> loadAndScheduleAlarms() async {
    final prefs = await SharedPreferences.getInstance();
    final alarmsJson = prefs.getStringList('alarms') ?? [];

    for (int i = 0; i < alarmsJson.length; i++) {
      try {
        final alarm = jsonDecode(alarmsJson[i]) as Map<String, dynamic>;

        if (alarm['enabled'] == true) {
          final timeString = alarm['time'] as String;
          print('Parsing alarm time: $timeString');

          // Handle different time formats
          TimeOfDay timeOfDay;
          if (timeString.contains(':')) {
            final parts = timeString.split(':');
            if (parts.length >= 2) {
              final hour = int.parse(parts[0]);
              final minutePart = parts[1];

              // Extract minute and period
              final minuteStr = minutePart.split(' ')[0];
              final minute = int.parse(minuteStr);
              final period =
                  minutePart.contains(' ') ? minutePart.split(' ')[1] : '';

              // Convert to 24-hour format
              final hour24 =
                  period == 'PM' && hour != 12
                      ? hour + 12
                      : (period == 'AM' && hour == 12 ? 0 : hour);

              timeOfDay = TimeOfDay(hour: hour24, minute: minute);
              print('Parsed time: ${timeOfDay.hour}:${timeOfDay.minute}');
            } else {
              print('Invalid time format for alarm $i');
              continue;
            }
          } else {
            print('Invalid time format for alarm $i');
            continue;
          }

          await scheduleAlarm(alarm['name'], timeOfDay, i);
          print(
            'Scheduled alarm: ${alarm['name']} at ${timeOfDay.hour}:${timeOfDay.minute.toString().padLeft(2, '0')}',
          );
        }
      } catch (e) {
        print('Error scheduling alarm $i: $e');
      }
    }
  }

  static Future<void> rescheduleAllAlarms() async {
    await _notificationsPlugin.cancelAll();
    await loadAndScheduleAlarms();
  }
}
