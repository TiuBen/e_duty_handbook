import 'package:flutter/material.dart';

/// 告警等级枚举
enum AlertLevel {
  warning, // 红色 – 警告级
  caution, // 琥珀色/黄色 – 告诫级
  info, // 青色/蓝色 – 状态/提示
  normal, // 绿色/白色 – 正常/已工作
}

/// 告警等级工具类
class AlertLevelHelper {
  static Color getColor(AlertLevel level) {
    switch (level) {
      case AlertLevel.warning:
        return Colors.red;
      case AlertLevel.caution:
        return Colors.amber;
      case AlertLevel.info:
        return Colors.blue;
      case AlertLevel.normal:
        return Colors.green;
    }
  }

  static String getDescription(AlertLevel level) {
    switch (level) {
      case AlertLevel.warning:
        return "警告级";
      case AlertLevel.caution:
        return "告诫级";
      case AlertLevel.info:
        return "状态/提示";
      case AlertLevel.normal:
        return "正常/已工作";
    }
  }
}

/// 主类：信息条目
class InfoItem {
  final String id; // ID
  final String mainTitle; // 主标题
  final String subTitle; // 子标题
  final String detailText; // 详细文本信息
  final String? detailImage; // 详细图片（可选）
  final String category; // 所属信息类别
  final DateTime createdTime; // 创建时间
  final String createdBy; // 创建人
  final String detailedCreationInfo; // 详细创建信息
  final String? confirmedBy; // 确认人（可选）
  final DateTime? confirmedTime; // 确认时间（可选）
  final String? detailedConfirmationInfo; // 详细确认信息（可选）
  final AlertLevel alertLevel; // 所属告警等级
  final List<InfoItem>? nestedItems; // 嵌套的子条目（可选）

  InfoItem({
    required this.id,
    required this.mainTitle,
    required this.subTitle,
    required this.detailText,
    this.detailImage,
    required this.category,
    required this.createdTime,
    required this.createdBy,
    required this.detailedCreationInfo,
    this.confirmedBy,
    this.confirmedTime,
    this.detailedConfirmationInfo,
    required this.alertLevel,
    this.nestedItems,
  });

  /// 获取告警等级的颜色
  Color get alertColor => AlertLevelHelper.getColor(alertLevel);

  /// 获取告警等级的描述
  String get alertDescription => AlertLevelHelper.getDescription(alertLevel);
}
