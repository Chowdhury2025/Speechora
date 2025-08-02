class QuizItem {
  final String subject;
  final String imageUrl;
  final String imageName;
  final String description;
  final String ageGroup;

  QuizItem({
    required this.subject,
    required this.imageUrl,
    required this.imageName,
    required this.description,
    required this.ageGroup,
  });

  factory QuizItem.fromJson(Map<String, dynamic> json) => QuizItem(
    subject: json['subject'],
    imageUrl: json['imageUrl'],
    imageName: json['imageName'],
    description: json['description'],
    ageGroup: json['ageGroup'],
  );
}
