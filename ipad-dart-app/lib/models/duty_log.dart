class DutyLog {
  final int id;
  final DateTime logDate;
  final int userId;

  DutyLog({required this.id, required this.logDate, required this.userId});

  factory DutyLog.fromJson(Map<String, dynamic> json) {
    return DutyLog(
      id: json['id'] as int,
      logDate: DateTime.parse(json['logDate'] as String),
      userId: json['userId'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'logDate': logDate.toIso8601String(), 'userId': userId};
  }
}
