// lib/widgets/item_tile.dart
import 'package:flutter/material.dart';
import '../models/InfoItem.dart';

class ItemTile extends StatefulWidget {
  final Item item;

  const ItemTile({super.key, required this.item});

  @override
  State<ItemTile> createState() => _ItemTileState();
}

class _ItemTileState extends State<ItemTile> {
  @override
  Widget build(BuildContext context) {
    // 根据状态和确认情况设置样式
    final bool isConfirmed = widget.item.status == ItemStatus.confirmed;
    final TextStyle contentStyle = isConfirmed
        ? const TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)
        : const TextStyle(color: Colors.black87);

    return Dismissible(
      key: Key('item-${widget.item.id}'),
      direction: DismissDirection.endToStart,
      confirmDismiss: (direction) async {
        if (direction == DismissDirection.endToStart) {
          // 模拟确认操作
          print("Item ${widget.item.id} confirmed by current user.");
          if (mounted) {
            setState(() {
              // 这里只是模拟状态变化，实际数据应来自数据库
              widget.item.addConfirmer(
                User(id: "current_user_id", name: "Current User"),
              );
              widget.item.status = ItemStatus.confirmed;
            });
          }
          return true;
        }
        return false;
      },
      background: Container(
        color: Colors.green,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20.0),
        child: const Icon(Icons.check, color: Colors.white),
      ),
      child: ListTile(
        title: Text(widget.item.content, style: contentStyle),
        subtitle: _buildSubtitle(),
        onLongPress: () => _startRecordingAndSend(widget.item),
        tileColor: isConfirmed ? Colors.grey.shade100 : null,
      ),
    );
  }

  Widget? _buildSubtitle() {
    String subtitleText = '';
    String timeText = '';
    String personText = '';

    if (widget.item.modifiedAt != null) {
      timeText =
          'Modified: ${_formatDateTime(widget.item.effectiveModifiedTime)}';
      personText = 'by ${widget.item.modifier?.name ?? 'Unknown'}';
    } else {
      timeText = 'Created: ${_formatDateTime(widget.item.createdAt)}';
      personText = 'by ${widget.item.creator.name}';
    }

    subtitleText = '$timeText | $personText';

    if (widget.item.status == ItemStatus.confirmed &&
        widget.item.confirmers.isNotEmpty) {
      final confirmerNames = widget.item.confirmers
          .map((u) => u.name)
          .join(', ');
      subtitleText += '\nConfirmed by: $confirmerNames';
    }

    return subtitleText.isNotEmpty ? Text(subtitleText) : null;
  }

  String _formatDateTime(DateTime dateTime) {
    return "${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')} ${dateTime.day}/${dateTime.month}/${dateTime.year}";
  }

  void _startRecordingAndSend(Item item) {
    print("Long press on item '${item.content}'. Start recording...");
    // TODO: Implement recording logic
  }
}
