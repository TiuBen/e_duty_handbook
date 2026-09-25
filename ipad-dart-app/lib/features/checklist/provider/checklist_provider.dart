import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api.dart';
import '../../../models/position.dart';

final checklistProvider =
    AsyncNotifierProvider<ChecklistNotifier, List<Position>>(
      ChecklistNotifier.new,
    );

class ChecklistNotifier extends AsyncNotifier<List<Position>> {
  @override
  Future<List<Position>> build() async {
    final response = await Api.get("/positions");

    final List<dynamic> rawData = response.data;
    return rawData
        .map((e) => Position.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}

// final checklistProvider = FutureProvider<String>((ref) async {
//   final dio = Dio();

//   final response = await dio.get("http://localhost:3000/api/positions");

//   return response.data.toString();
// });
