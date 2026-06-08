import 'Source.dart';
import 'User.dart';
import 'Position.dart';
import 'Category.dart';

class Info {
  final int id;
  final String description;
  final DateTime createdAt;
  final DateTime startTime;
  final DateTime endTime;
  final String validRule;
  final int sourceId;
  final Source? infoSource; // 关联关系
  final int? creatorUserId; // 可选外键
  final int? creatorPositionId; // 可选外键
  final User? creatorUser; // 关联关系
  final Position? creatorPosition; // 关联关系
  final int? categoryId; // 可选外键
  final Category? category; // 关联关系

  Info({
    required this.id,
    required this.description,
    required this.createdAt,
    required this.startTime,
    required this.endTime,
    required this.validRule,
    required this.sourceId,
    this.infoSource,
    this.creatorUserId,
    this.creatorPositionId,
    this.creatorUser,
    this.creatorPosition,
    this.categoryId,
    this.category,
  });

  factory Info.fromJson(Map<String, dynamic> json) {
    return Info(
      id: json['id'] as int,
      description: json['description'] as String,
      // 解析 ISO 8601 时间字符串
      createdAt: DateTime.parse(json['createdAt'] as String),
      startTime: DateTime.parse(json['startTime'] as String),
      endTime: DateTime.parse(json['endTime'] as String),
      validRule: json['validRule'] as String,
      sourceId: json['sourceId'] as int,
      // 关系解析
      infoSource: json['infoSource'] != null
          ? Source.fromJson(json['infoSource'])
          : null,
      creatorUserId: json['creatorUserId'] as int?,
      creatorPositionId: json['creatorPositionId'] as int?,
      creatorUser: json['creatorUser'] != null
          ? User.fromJson(json['creatorUser'])
          : null,
      creatorPosition: json['creatorPosition'] != null
          ? Position.fromJson(json['creatorPosition'])
          : null,
      categoryId: json['categoryId'] as int?,
      category: json['category'] != null
          ? Category.fromJson(json['category'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'description': description,
      'createdAt': createdAt.toIso8601String(),
      'startTime': startTime.toIso8601String(),
      'endTime': endTime.toIso8601String(),
      'validRule': validRule,
      'sourceId': sourceId,
      'creatorUserId': creatorUserId,
      'creatorPositionId': creatorPositionId,
      'categoryId': categoryId,
    };
  }
}
