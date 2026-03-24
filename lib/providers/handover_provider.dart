import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/handover_service.dart';

final handoverListProvider = FutureProvider<List<dynamic>>((ref) async {
  final result = await HandoverService.getList();
  return result;
});
