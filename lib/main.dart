import 'package:e_duty_handbook/domain/handover_config.dart';
import 'package:e_duty_handbook/domain/handover_status.dart';
import 'package:e_duty_handbook/widgets/HandoverItem.dart';
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'widgets/HandoverPage.dart';

final helloWorldProvider = Provider((_) => 'Hello world');

void main() {
  runApp(ProviderScope(child: MainApp()));
}

class MainApp extends HookConsumerWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final counter = useState(0);
    final String value = ref.watch(helloWorldProvider);

    return MaterialApp(
      home: Scaffold(
        body: Column(
          children: [
            Text('$value ==== ${counter.value}'),
            Text('$value ==== ${counter.value}'),
            HandoverPage(),
            HandoverItem(
              status: HandoverStatus.normal,
              isConfirmed: true,
              config: HandoverConfig(
                normalColor: Colors.lightGreenAccent,
                importantColor: Colors.redAccent,
                confirmedOverlay: Colors.grey,
                borderColor: Colors.black26,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
