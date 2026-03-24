import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../providers/handover_provider.dart';

class HandoverPage extends HookConsumerWidget {
  const HandoverPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncValue = ref.watch(handoverListProvider);

    return asyncValue.when(
      loading: () => const Center(child: CircularProgressIndicator()),

      error: (err, stack) => Center(
        child: Text("错误: $err"),
      ),

      data: (list) {
        return Container(
          width: 300,
          decoration: BoxDecoration(border: Border.all()),
          padding: const EdgeInsets.all(8),
          child:  Text(
            list.toString(), // ✅ 直接转字符串
          ),
        );

      }
    );
  }
}