import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api.dart';
import '../../../models/info.dart';

final infoProvider = AsyncNotifierProvider<InfoNotifier, List<Info>>(
  InfoNotifier.new,
);

class InfoNotifier extends AsyncNotifier<List<Info>> {
  @override
  Future<List<Info>> build() async {
    final response = await Api.get("/infos");

    final List<dynamic> rawData = response.data;

    return rawData
        .map((e) => Info.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  ///刷新
  Future<void> refresh() async {
    state = const AsyncLoading();

    state = await AsyncValue.guard(() async {
      final response = await Api.get("/info");

      final List<dynamic> rawData = response.data;

      return rawData
          .map((e) => Info.fromJson(e as Map<String, dynamic>))
          .toList();
    });
  }
}
