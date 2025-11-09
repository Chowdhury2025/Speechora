import 'package:flutter/material.dart';
import '../services/presentation1_service.dart';

class Presentation1TestScreen extends StatefulWidget {
  const Presentation1TestScreen({super.key});

  @override
  State<Presentation1TestScreen> createState() => _Presentation1TestScreenState();
}

class _Presentation1TestScreenState extends State<Presentation1TestScreen> {
  final Presentation1Service _service = Presentation1Service();
  bool _isLoading = true;
  String _status = 'Initializing...';
  Map<String, int> _stats = {};
  Map<String, dynamic> _storageInfo = {};

  @override
  void initState() {
    super.initState();
    _testService();
  }

  Future<void> _testService() async {
    try {
      setState(() {
        _status = 'Loading all images securely...';
      });

      await _service.initializeAllImages();

      final storageInfo = await _service.getStorageInfo();

      setState(() {
        _stats = _service.getCategoryStats();
        _storageInfo = storageInfo;
        _status = 'Success! Loaded ${_service.getAllImages().length} images to secure storage';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _status = 'Error: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Secure Presentation1 Service Test'),
        backgroundColor: const Color(0xFF1CB0F6),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Service Status',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      if (_isLoading)
                        const CircularProgressIndicator()
                      else
                        Text(
                          _status,
                          style: TextStyle(
                            color: _status.contains('Error') ? Colors.red : Colors.green,
                            fontSize: 16,
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              
              // Secure Storage Information
              if (_storageInfo.isNotEmpty) ...[
                const Text(
                  'Secure Storage Information',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildInfoRow('JSON Cache', _storageInfo['jsonCacheExists'] ? '✅ Exists' : '❌ Not found'),
                        if (_storageInfo['jsonCacheSize'] != null)
                          _buildInfoRow('JSON Size', _service.formatBytes(_storageInfo['jsonCacheSize'])),
                        _buildInfoRow('Images Cached', '${_storageInfo['imagesCachedCount']} files'),
                        if (_storageInfo['totalImagesSize'] != null)
                          _buildInfoRow('Images Size', _service.formatBytes(_storageInfo['totalImagesSize'])),
                        _buildInfoRow('Cache Location', '📁 Hidden app directory'),
                        const Divider(),
                        Text(
                          'JSON Path: ${_storageInfo['jsonCachePath'] ?? 'N/A'}',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                        Text(
                          'Images Path: ${_storageInfo['imagesCachePath'] ?? 'N/A'}',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
              
              // Category Statistics
              if (_stats.isNotEmpty) ...[
                const Text(
                  'Category Statistics',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: _stats.entries.map((entry) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(entry.key.replaceAll('_', ' ').toUpperCase()),
                              Text(
                                '${entry.value} images',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 16),
              
              // Action Buttons
              if (!_isLoading && !_status.contains('Error')) ...[
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () async {
                          setState(() {
                            _isLoading = true;
                            _status = 'Force refreshing...';
                          });
                          await _service.initializeAllImages(forceRefresh: true);
                          final storageInfo = await _service.getStorageInfo();
                          setState(() {
                            _stats = _service.getCategoryStats();
                            _storageInfo = storageInfo;
                            _status = 'Refreshed! Loaded ${_service.getAllImages().length} images';
                            _isLoading = false;
                          });
                        },
                        child: const Text('Force Refresh'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                        onPressed: () async {
                          setState(() {
                            _isLoading = true;
                            _status = 'Clearing secure cache...';
                          });
                          await _service.clearCache();
                          final storageInfo = await _service.getStorageInfo();
                          setState(() {
                            _stats = {};
                            _storageInfo = storageInfo;
                            _status = 'Cache cleared successfully';
                            _isLoading = false;
                          });
                        },
                        child: const Text('Clear Cache'),
                      ),
                    ),
                  ],
                ),
              ],
              
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '🔒 Security Features',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8),
                    Text('✅ JSON data saved in hidden app directory'),
                    Text('✅ Images cached with secure hashed filenames'),
                    Text('✅ No files visible to users or file managers'),
                    Text('✅ Automatic cleanup on app uninstall'),
                    Text('✅ No external storage permissions required'),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
          Text(value, style: const TextStyle(color: Colors.blue)),
        ],
      ),
    );
  }
}