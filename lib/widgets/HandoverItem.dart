import 'package:flutter/material.dart';
import '../domain/handover_config.dart';
import '../domain/handover_status.dart';


class HandoverItem extends StatelessWidget {
  final String title;
  final String? subtitle;
  final String? imageUrl;

  final HandoverStatus status;
  final bool isConfirmed;

  final VoidCallback? onDoubleTap;
  final VoidCallback? onImageTap;
  final VoidCallback? onVoiceStart;
  final VoidCallback? onVoiceEnd;
  final VoidCallback? onSlideConfirm;

  final HandoverConfig config;

  const HandoverItem({
    super.key,
    this.title="默认内容",
    this.subtitle="默认内容",
    this.imageUrl="https://picsum.photos/600/400",
    required this.status,
    required this.isConfirmed,
    required this.config,
    this.onDoubleTap,
    this.onImageTap,
    this.onVoiceStart,
    this.onVoiceEnd,
    this.onSlideConfirm,
  });

  Color getBgColor() {
    switch (status) {
      case HandoverStatus.important:
        return config.importantColor;
      case HandoverStatus.normal:
      default:
        return config.normalColor;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onDoubleTap: onDoubleTap,
      child: Stack(
        children: [
          Container(
            margin: const EdgeInsets.all(6),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: getBgColor(),
              border: Border.all(color: config.borderColor),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Row(
              children: [
                /// 左侧文本
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title,
                          style: const TextStyle(fontSize: 16)),
                      if (subtitle != null)
                        Text(
                          subtitle!,
                          style: const TextStyle(
                              fontSize: 12, color: Colors.grey),
                        ),
                    ],
                  ),
                ),

                /// 缩略图
                if (imageUrl != null)
                  GestureDetector(
                    onTap: onImageTap,
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 8),
                      width: 60,
                      height: 40,
                      color: Colors.grey[300],
                      child: Image.network(imageUrl!, fit: BoxFit.cover),
                    ),
                  ),

                /// 麦克风按钮
                GestureDetector(
                  onLongPressStart: (_) => onVoiceStart?.call(),
                  onLongPressEnd: (_) => onVoiceEnd?.call(),
                  child: const Icon(Icons.mic),
                ),
              ],
            ),
          ),

          /// ✅ 已确认水印
          if (isConfirmed)
            Positioned.fill(
              child: IgnorePointer(
                child: Center(
                  child: Transform.rotate(
                    angle: -0.3,
                    child: Text(
                      "已确认",
                      style: TextStyle(
                        fontSize: 40,
                        color: config.confirmedOverlay.withOpacity(0.3),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}