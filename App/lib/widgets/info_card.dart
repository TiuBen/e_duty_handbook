import 'package:flutter/material.dart';
import '../models/info.dart';

class InfoCard extends StatelessWidget {
  final Info info;
  final bool confirmed;
  final VoidCallback? onTap;

  const InfoCard({
    super.key,
    required this.info,
    this.confirmed = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          border: Border.all(color: Colors.black, width: 1),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    info.category?.name ?? info.infoSource?.name ?? '未知来源',
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 12),

                  Text(info.description, style: const TextStyle(fontSize: 18)),

                  const SizedBox(height: 12),

                  Text(
                    "${info.creatorPosition?.title}  ${info.creatorUser?.username}",
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),

            const SizedBox(width: 20),

            confirmed
                ? const Text("已确认", style: TextStyle(fontSize: 18))
                : Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      border: Border.all(),
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: const Text("待确认"),
                  ),
          ],
        ),
      ),
    );
  }
}
