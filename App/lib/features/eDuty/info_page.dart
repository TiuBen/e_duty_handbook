import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/info_provider.dart';
import '../../widgets//info_category.dart';
import '../../models/info.dart';

class InfoPage extends ConsumerWidget {
  const InfoPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final infos = ref.watch(infoProvider);

    return Scaffold(
      body: infos.when(
        loading: () => const Center(child: CircularProgressIndicator()),

        error: (err, stack) => Center(child: Text(err.toString())),

        data: (list) {
          final Map<String, List<Info>> groups = {};

          for (final item in list) {
            final key = item.category?.name ?? "未分类";

            groups.putIfAbsent(key, () => []);

            groups[key]!.add(item);
          }

          return ListView(
            children: groups.entries.map((entry) {
              return InfoCategory(title: entry.key, infos: entry.value);
            }).toList(),
          );
        },
      ),
    );
  }
}
