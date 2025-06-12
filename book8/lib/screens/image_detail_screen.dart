import 'package:flutter/material.dart';
import '../models/image_model.dart';
import '../services/image_service.dart';

class ImageDetailScreen extends StatefulWidget {
  final int imageId;

  const ImageDetailScreen({super.key, required this.imageId});

  @override
  State<ImageDetailScreen> createState() => _ImageDetailScreenState();
}

class _ImageDetailScreenState extends State<ImageDetailScreen> {
  final ImageService _imageService = ImageService();
  bool _isLoading = true;
  ImageModel? _image;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadImage();
  }

  Future<void> _loadImage() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      final image = await _imageService.getImageById(widget.imageId);

      setState(() {
        _image = image;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _deleteImage() async {
    try {
      await _imageService.deleteImage(widget.imageId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Image deleted successfully')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to delete image: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_image?.title ?? 'Image Detail'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              Navigator.pushNamed(
                context,
                '/image-edit',
                arguments: _image,
              ).then((_) => _loadImage());
            },
          ),
          IconButton(
            icon: const Icon(Icons.delete),
            onPressed: () {
              showDialog(
                context: context,
                builder:
                    (context) => AlertDialog(
                      title: const Text('Delete Image'),
                      content: const Text(
                        'Are you sure you want to delete this image?',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Cancel'),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.pop(context);
                            _deleteImage();
                          },
                          style: TextButton.styleFrom(
                            foregroundColor: Colors.red,
                          ),
                          child: const Text('Delete'),
                        ),
                      ],
                    ),
              );
            },
          ),
        ],
      ),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _errorMessage != null
              ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      _errorMessage!,
                      style: const TextStyle(color: Colors.red),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _loadImage,
                      child: const Text('Try Again'),
                    ),
                  ],
                ),
              )
              : _image == null
              ? const Center(child: Text('Image not found'))
              : SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Image.network(
                      _image!.imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          height: 200,
                          color: Colors.grey[300],
                          child: const Icon(Icons.error),
                        );
                      },
                    ),
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _image!.title,
                            style: Theme.of(context).textTheme.headlineSmall,
                          ),
                          if (_image!.description != null) ...[
                            const SizedBox(height: 8),
                            Text(
                              _image!.description!,
                              style: Theme.of(context).textTheme.bodyLarge,
                            ),
                          ],
                          const SizedBox(height: 16),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              if (_image!.category != null)
                                Chip(label: Text(_image!.category!)),
                              if (_image!.ageGroup != null)
                                Chip(label: Text('Age: ${_image!.ageGroup!}')),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Card(
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Additional Information',
                                    style:
                                        Theme.of(context).textTheme.titleMedium,
                                  ),
                                  const SizedBox(height: 8),
                                  if (_image!.name != null)
                                    ListTile(
                                      leading: const Icon(Icons.label),
                                      title: const Text('Name'),
                                      subtitle: Text(_image!.name!),
                                    ),
                                  if (_image!.position != null)
                                    ListTile(
                                      leading: const Icon(Icons.sort),
                                      title: const Text('Position'),
                                      subtitle: Text(
                                        _image!.position.toString(),
                                      ),
                                    ),
                                  ListTile(
                                    leading: const Icon(Icons.calendar_today),
                                    title: const Text('Created'),
                                    subtitle: Text(
                                      _image!.createdAt
                                          .toLocal()
                                          .toString()
                                          .split('.')[0],
                                    ),
                                  ),
                                  ListTile(
                                    leading: const Icon(Icons.update),
                                    title: const Text('Last Updated'),
                                    subtitle: Text(
                                      _image!.updatedAt
                                          .toLocal()
                                          .toString()
                                          .split('.')[0],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
    );
  }
}
