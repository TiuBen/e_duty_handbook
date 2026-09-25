class ShiftItem {
  final int id;
  final DateTime shiftDate;

  ShiftItem({required this.id, required this.shiftDate});

  factory ShiftItem.fromJson(Map<String, dynamic> json) {
    return ShiftItem(
      id: json['id'] as int,
      shiftDate: DateTime.parse(json['shiftDate'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'shiftDate': shiftDate.toIso8601String()};
  }
}
