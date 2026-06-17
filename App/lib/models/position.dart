class Position {
  final int id;
  final String title;

  Position({required this.id, required this.title});

  factory Position.fromJson(Map<String, dynamic> json) {
    return Position(id: json['id'] as int, title: json['title'] as String);
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'title': title};
  }
}
