import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../provider/checklist_provider.dart';

class ChecklistPage extends ConsumerWidget {
  const ChecklistPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final positions = ref.watch(checklistProvider);

    return Scaffold(
      appBar: AppBar(title: const Text("测试页面")),
      body: positions.when(
        loading: () {
          return const Center(child: CircularProgressIndicator());
        },
        error: (err, stack) {
          return Center(child: Text(err.toString()));
        },
        data: (list) {
          return ListView.builder(
            itemCount: list.length,
            itemBuilder: (context, index) {
              return Padding(
                padding: const EdgeInsets.all(12),
                child: Text(list[index], style: const TextStyle(fontSize: 22)),
              );
            },
          );
        },
      ),
    );
  }
}
