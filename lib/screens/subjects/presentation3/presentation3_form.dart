import 'package:book8/constants/constants.dart';
import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class Presentation3Form extends StatefulWidget {
  const Presentation3Form({Key? key}) : super(key: key);

  @override
  _Presentation3FormState createState() => _Presentation3FormState();
}

class _Presentation3FormState extends State<Presentation3Form> {
  final _formKey = GlobalKey<FormState>();

  String _subject = '';
  String _imageUrl = '';
  String _imageName = '';
  String _description = '';
  String _ageGroup = '3-5 years';
  bool _isLoading = false;

  final List<String> _ageGroups = [
    '3-5 years',
    '6-8 years',
    '9-12 years',
    '13+ years',
  ];

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final response = await http.post(
        Uri.parse('${Constants.baseUrl}/presentation3'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'subject': _subject,
          'imageUrl': _imageUrl,
          'imageName': _imageName,
          'description': _description,
          'ageGroup': _ageGroup,
          'userId': 1, // Replace with actual user ID from authentication
        }),
      );

      if (response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Item created successfully!')),
        );
        Navigator.pop(context);
      } else {
        throw Exception('Failed to create item');
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: ${e.toString()}')));
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Presentation Item'),
        backgroundColor: Colors.teal,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                decoration: const InputDecoration(
                  labelText: 'Subject',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a subject';
                  }
                  return null;
                },
                onSaved: (value) => _subject = value!,
              ),
              const SizedBox(height: 16),
              TextFormField(
                decoration: const InputDecoration(
                  labelText: 'Image URL',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter an image URL';
                  }
                  return null;
                },
                onSaved: (value) => _imageUrl = value!,
              ),
              const SizedBox(height: 16),
              TextFormField(
                decoration: const InputDecoration(
                  labelText: 'Image Name',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter an image name';
                  }
                  return null;
                },
                onSaved: (value) => _imageName = value!,
              ),
              const SizedBox(height: 16),
              TextFormField(
                decoration: const InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a description';
                  }
                  return null;
                },
                onSaved: (value) => _description = value!,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Age Group',
                  border: OutlineInputBorder(),
                ),
                value: _ageGroup,
                items:
                    _ageGroups.map((String group) {
                      return DropdownMenuItem(value: group, child: Text(group));
                    }).toList(),
                onChanged: (String? newValue) {
                  setState(() {
                    _ageGroup = newValue!;
                  });
                },
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _submitForm,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.teal,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child:
                    _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('Submit', style: TextStyle(fontSize: 18)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
