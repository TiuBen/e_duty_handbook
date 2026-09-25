import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../provider/checklist_provider.dart';

class ChecklistWidget extends ConsumerWidget {
  const ChecklistWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final data = ref.watch(checklistProvider);

    return data.when(
      loading: () => const Text("Loading..."),

      error: (error, stack) => Text(error.toString()),

      data: (value) {
        // 1. 假设 value 是以逗号分隔的字符串，将其切分成 List<String>
        // 如果是以换行符分隔，可以用 value.split('\n')
        // final itemsList = value.split(',');
        final itemsList = value;
        debugPrint("---------------------------");
        debugPrint("检查 value 的运行类型: ${value.runtimeType}");
        debugPrint("检查 value 的真实内容: $value");
        debugPrint("---------------------------");

        // 2. 记得加上 return 关键字！
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            for (var item in value)
              ListTile(
                leading: CircleAvatar(
                  child: Text(item.id.toString()), // 显示 ID
                ),
                // 💡 此时你输入 item. 编译器就会自动提示 id 和 title，绝对不会写错！
                title: Text(
                  item.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                onTap: () {
                  print("你点击了岗位: ${item.title}");
                },
              ),
          ],
        );
      },
    );
  }
}
