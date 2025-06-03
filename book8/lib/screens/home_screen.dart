import 'package:flutter/material.dart';

class SubjectCard {
  final String title;
  final IconData icon;
  final Color color;

  SubjectCard({
    required this.title,
    required this.icon,
    required this.color,
  });
}

class MyHomePage extends StatelessWidget {
  MyHomePage({super.key, required this.title});

  final String title;

  final List<SubjectCard> subjects = [
    SubjectCard(
      title: 'Mathematics',
      icon: Icons.calculate,
      color: Colors.blue.shade300,
    ),
    SubjectCard(
      title: 'Science',
      icon: Icons.science,
      color: Colors.green.shade300,
    ),
    SubjectCard(
      title: 'Reading',
      icon: Icons.menu_book,
      color: Colors.purple.shade300,
    ),
    SubjectCard(
      title: 'Art',
      icon: Icons.palette,
      color: Colors.pink.shade300,
    ),
    SubjectCard(
      title: 'Music',
      icon: Icons.music_note,
      color: Colors.orange.shade300,
    ),
    SubjectCard(
      title: 'Games',
      icon: Icons.sports_esports,
      color: Colors.red.shade300,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage('assets/appbg.png'),
            fit: BoxFit.cover,
          ),
        ),
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  'Let\'s Learn Together!',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        shadows: [
                          const Shadow(
                            offset: Offset(1.0, 1.0),
                            blurRadius: 3.0,
                            color: Colors.black26,
                          ),
                        ],
                      ),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 1.1,
                    ),
                    itemCount: subjects.length,
                    itemBuilder: (context, index) {
                      final subject = subjects[index];
                      return _buildSubjectCard(subject);
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSubjectCard(SubjectCard subject) {
    return Material(
      color: subject.color,
      borderRadius: BorderRadius.circular(20),
      elevation: 4,
      child: InkWell(
        onTap: () {
          // TODO: Navigate to subject detail screen
        },
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                subject.icon,
                size: 48,
                color: Colors.white,
              ),
              const SizedBox(height: 12),
              Text(
                subject.title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
