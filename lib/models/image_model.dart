class ImageModel {
  final int id;
  final String imageUrl;
  final String title;
  final String? thumbnail;
  final String? category;
  final int? position;
  final String? description;
  final String? ageGroup;
  final String? name;
  final int? userId;
  final DateTime createdAt;
  final DateTime updatedAt;

  ImageModel({
    required this.id,
    required this.imageUrl,
    required this.title,
    this.thumbnail,
    this.category,
    this.position,
    this.description,
    this.ageGroup,
    this.name,
    this.userId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ImageModel.fromJson(Map<String, dynamic> json) {
    return ImageModel(
      id: json['id'] as int,
      imageUrl: json['imageUrl'] as String,
      title: json['title'] as String,
      thumbnail: json['thumbnail'] as String?,
      category: json['category'] as String?,
      position: json['position'] as int?,
      description: json['description'] as String?,
      ageGroup: json['ageGroup'] as String?,
      name: json['name'] as String?,
      userId: json['userId'] as int?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'imageUrl': imageUrl,
      'title': title,
      'thumbnail': thumbnail,
      'category': category,
      'position': position,
      'description': description,
      'ageGroup': ageGroup,
      'name': name,
      'userId': userId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  ImageModel copyWith({
    String? imageUrl,
    String? title,
    String? thumbnail,
    String? category,
    int? position,
    String? description,
    String? ageGroup,
    String? name,
  }) {
    return ImageModel(
      id: id,
      imageUrl: imageUrl ?? this.imageUrl,
      title: title ?? this.title,
      thumbnail: thumbnail ?? this.thumbnail,
      category: category ?? this.category,
      position: position ?? this.position,
      description: description ?? this.description,
      ageGroup: ageGroup ?? this.ageGroup,
      name: name ?? this.name,
      userId: userId,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
    );
  }
}
