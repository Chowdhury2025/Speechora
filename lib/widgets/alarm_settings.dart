import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:book8/services/notification_service.dart';

class AlarmSettings extends StatefulWidget {
  const AlarmSettings({super.key});

  @override
  State<AlarmSettings> createState() => _AlarmSettingsState();
}

class _AlarmSettingsState extends State<AlarmSettings> {
  int dailyUsageLimit = 2; // Default 2 hours
  List<Map<String, dynamic>> alarms = [];

  @override
  void initState() {
    super.initState();
    _loadSettings();
    _loadAndScheduleAlarms();
  }

  Future<void> _loadAndScheduleAlarms() async {
    await AlarmService.loadAndScheduleAlarms();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      dailyUsageLimit = prefs.getInt('dailyUsageLimit') ?? 2;
      final alarmsJson = prefs.getStringList('alarms') ?? [];
      alarms =
          alarmsJson
              .map((alarm) => jsonDecode(alarm) as Map<String, dynamic>)
              .toList();
    });
  }

  Future<void> _saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('dailyUsageLimit', dailyUsageLimit);
    final alarmsJson = alarms.map((alarm) => jsonEncode(alarm)).toList();
    await prefs.setStringList('alarms', alarmsJson);
    await AlarmService.rescheduleAllAlarms();
  }

  void _showUsageLimitDialog() {
    TextEditingController controller = TextEditingController(
      text: dailyUsageLimit.toString(),
    );

    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            backgroundColor: Theme.of(context).primaryColor,
            title: const Text(
              'Set Daily Usage Limit',
              style: TextStyle(color: Colors.white),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Set the maximum hours you want to use the app per day:',
                  style: TextStyle(color: Colors.white),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: controller,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Hours',
                    hintText: 'Enter hours (1-12)',
                    labelStyle: TextStyle(color: Colors.white70),
                    hintStyle: TextStyle(color: Colors.white54),
                    enabledBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: Colors.white70),
                    ),
                    focusedBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: Colors.white),
                    ),
                    suffixText: 'hours',
                    suffixStyle: TextStyle(color: Colors.white70),
                  ),
                  onChanged: (value) {
                    final hours = int.tryParse(value);
                    if (hours != null && hours >= 1 && hours <= 12) {
                      dailyUsageLimit = hours;
                    }
                  },
                ),
                const SizedBox(height: 8),
                const Text(
                  'Valid range: 1-12 hours',
                  style: TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text(
                  'Cancel',
                  style: TextStyle(color: Colors.white70),
                ),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                onPressed: () {
                  final inputValue = int.tryParse(controller.text);
                  if (inputValue != null &&
                      inputValue >= 1 &&
                      inputValue <= 12) {
                    setState(() {
                      dailyUsageLimit = inputValue;
                    });
                    _saveSettings();
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'Daily usage limit set to $dailyUsageLimit hours',
                        ),
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'Please enter a valid number between 1 and 12',
                        ),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                },
                child: const Text('Save'),
              ),
            ],
          ),
    );
  }

  void _deleteAlarm(int index) {
    final alarm = alarms[index];
    final alarmName = alarm['name'];

    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            backgroundColor: Theme.of(context).primaryColor,
            title: const Text(
              'Delete Alarm',
              style: TextStyle(color: Colors.white),
            ),
            content: Text(
              'Are you sure you want to delete the alarm "$alarmName"?',
              style: const TextStyle(color: Colors.white),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text(
                  'Cancel',
                  style: TextStyle(color: Colors.white70),
                ),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                onPressed: () {
                  setState(() {
                    alarms.removeAt(index);
                  });
                  _saveSettings();
                  Navigator.pop(context);

                  // Cancel the scheduled alarm
                  AlarmService.cancelAlarm(index);

                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Alarm "$alarmName" deleted')),
                  );
                },
                child: const Text('Delete'),
              ),
            ],
          ),
    );
  }

  void _showCreateAlarmDialog() {
    String alarmName = '';
    TimeOfDay selectedTime = TimeOfDay.now();

    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            backgroundColor: Theme.of(context).primaryColor,
            title: const Text(
              'Create Alarm',
              style: TextStyle(color: Colors.white),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Alarm Name',
                    hintText: 'e.g., Sleep Alarm, Wake Up, School Reminder',
                    labelStyle: TextStyle(color: Colors.white70),
                    hintStyle: TextStyle(color: Colors.white54),
                    enabledBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: Colors.white70),
                    ),
                    focusedBorder: UnderlineInputBorder(
                      borderSide: BorderSide(color: Colors.white),
                    ),
                  ),
                  onChanged: (value) => alarmName = value,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Text('Time: ', style: TextStyle(color: Colors.white)),
                    TextButton(
                      onPressed: () async {
                        final time = await showTimePicker(
                          context: context,
                          initialTime: selectedTime,
                        );
                        if (time != null) {
                          setState(() {
                            selectedTime = time;
                          });
                        }
                      },
                      child: Text(
                        selectedTime.format(context),
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text(
                  'Cancel',
                  style: TextStyle(color: Colors.white70),
                ),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                onPressed: () {
                  if (alarmName.isNotEmpty) {
                    final newAlarm = {
                      'name': alarmName,
                      'time': selectedTime.format(context),
                      'enabled': true,
                    };

                    setState(() {
                      alarms.add(newAlarm);
                    });
                    _saveSettings();
                    Navigator.pop(context);

                    AlarmService.scheduleAlarm(
                      alarmName,
                      selectedTime,
                      alarms.length - 1,
                    );

                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Alarm "$alarmName" created')),
                    );
                  }
                },
                child: const Text('Create'),
              ),
            ],
          ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ListTile(
          leading: const Icon(Icons.timer, color: Colors.white),
          title: const Text(
            'Daily Usage Limit',
            style: TextStyle(color: Colors.white),
          ),
          subtitle: Text(
            '$dailyUsageLimit hours per day',
            style: const TextStyle(color: Colors.white70),
          ),
          onTap: _showUsageLimitDialog,
        ),
        const Divider(color: Colors.white24),
        ListTile(
          leading: const Icon(Icons.alarm, color: Colors.white),
          title: const Text(
            'Create Alarm',
            style: TextStyle(color: Colors.white),
          ),
          subtitle: const Text(
            'Set custom alarms',
            style: TextStyle(color: Colors.white70),
          ),
          onTap: _showCreateAlarmDialog,
        ),
        const Divider(color: Colors.white24),
        ListTile(
          leading: const Icon(Icons.notifications, color: Colors.white),
          title: const Text(
            'Test Notification',
            style: TextStyle(color: Colors.white),
          ),
          subtitle: const Text(
            'Send a test notification to verify the system works',
            style: TextStyle(color: Colors.white70),
          ),
          onTap: () async {
            await NotificationService.showTestNotification();
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Test notification sent!')),
            );
          },
        ),
        const Divider(color: Colors.white24),
        ListTile(
          leading: const Icon(Icons.refresh, color: Colors.white),
          title: const Text(
            'Reschedule Alarms',
            style: TextStyle(color: Colors.white),
          ),
          subtitle: const Text(
            'Reload and reschedule all saved alarms',
            style: TextStyle(color: Colors.white70),
          ),
          onTap: () async {
            await AlarmService.rescheduleAllAlarms();
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Alarms rescheduled!')),
            );
          },
        ),
        const Divider(color: Colors.white24),
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 8.0),
          child: Text(
            'Your Alarms',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        if (alarms.isEmpty)
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text(
              'No alarms set yet. Tap "Create Alarm" to add one.',
              style: TextStyle(color: Colors.white70),
              textAlign: TextAlign.center,
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: alarms.length,
            itemBuilder: (context, index) {
              final alarm = alarms[index];
              return Container(
                margin: const EdgeInsets.symmetric(vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: ListTile(
                  leading: const Icon(Icons.alarm, color: Colors.white),
                  title: Text(
                    alarm['name'],
                    style: const TextStyle(color: Colors.white),
                  ),
                  subtitle: Text(
                    alarm['time'],
                    style: const TextStyle(color: Colors.white70),
                  ),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Switch(
                        value: alarm['enabled'],
                        activeColor: Colors.green,
                        onChanged: (value) {
                          setState(() {
                            alarm['enabled'] = value;
                          });
                          _saveSettings();
                        },
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () => _deleteAlarm(index),
                        tooltip: 'Delete alarm',
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
      ],
    );
  }
}
