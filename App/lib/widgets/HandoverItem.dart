import 'package:flutter/material.dart';
import '../domain/handover_config.dart';
import '../domain/handover_status.dart';
import '../models/info_item.dart';

class HandoverItem extends StatefulWidget {
  final InfoItem infoItem; // 信息条目
  final VoidCallback? onConfirm; // 确认回调
  final Function(String)? onVoiceInput; // 语音输入回调

  const HandoverItem({
    super.key,
    required this.infoItem,
    this.onConfirm,
    this.onVoiceInput,
  });

  @override
  State<HandoverItem> createState() => _HandoverItemState();
}

class _HandoverItemState extends State<HandoverItem> {
  bool isExpanded = false; // 是否展开
  bool isRecording = false; // 是否正在录音

  /// 获取最高告警等级颜色
  Color getHighestAlertColor() {
    if (widget.infoItem.nestedItems != null &&
        widget.infoItem.nestedItems!.isNotEmpty) {
      final highestAlert = widget.infoItem.nestedItems!
          .map((item) => item.alertLevel)
          .reduce((a, b) => a.index > b.index ? a : b);
      return AlertLevelHelper.getColor(highestAlert);
    }
    return AlertLevelHelper.getColor(widget.infoItem.alertLevel);
  }

  @override
  Widget build(BuildContext context) {
    final info = widget.infoItem;

    return GestureDetector(
      onTap: () {
        setState(() {
          isExpanded = !isExpanded; // 切换折叠/展开状态
        });
        if (!isExpanded) {
          widget.onConfirm?.call(); // 确认回调
        }
      },
      child: Container(
        margin: const EdgeInsets.all(8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(
            color: info.nestedItems != null && info.nestedItems!.isNotEmpty
                ? getHighestAlertColor()
                : AlertLevelHelper.getColor(info.alertLevel),
            width: 2,
          ),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.2),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            /// 主标题
            Text(
              info.mainTitle,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: info.nestedItems != null && info.nestedItems!.isNotEmpty
                    ? getHighestAlertColor()
                    : Colors.black,
              ),
            ),

            /// 子标题（半折叠状态）
            if (!isExpanded && info.subTitle.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  info.subTitle,
                  style: const TextStyle(fontSize: 14, color: Colors.grey),
                ),
              ),

            /// 展开状态显示更多信息
            if (isExpanded) ...[
              const SizedBox(height: 8),
              Text(info.detailText, style: const TextStyle(fontSize: 14)),
              if (info.detailImage != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Image.network(info.detailImage!),
                ),
              if (info.nestedItems != null && info.nestedItems!.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: info.nestedItems!
                        .map(
                          (nestedItem) => HandoverItem(
                            infoItem: nestedItem,
                            onConfirm: widget.onConfirm,
                            onVoiceInput: widget.onVoiceInput,
                          ),
                        )
                        .toList(),
                  ),
                ),
            ],

            /// 语音按钮
            Align(
              alignment: Alignment.centerRight,
              child: GestureDetector(
                onLongPress: () {
                  setState(() {
                    isRecording = true;
                  });
                  // 模拟录音开始
                  widget.onVoiceInput?.call("开始录音...");
                },
                onLongPressUp: () {
                  setState(() {
                    isRecording = false;
                  });
                  // 模拟录音结束
                  widget.onVoiceInput?.call("录音结束，发送到后端...");
                },
                child: Icon(
                  Icons.mic,
                  color: isRecording ? Colors.red : Colors.black,
                  size: 28,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
