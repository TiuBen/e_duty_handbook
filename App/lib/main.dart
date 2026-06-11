import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'features/checklist/page/ChecklistWidget.dart';
import 'features/eDuty/page/info_page.dart';

final helloWorldProvider = Provider((_) => 'Hello world');

// void main() {
//   runApp(ProviderScope(child: MainApp()));
// }

// class MainApp extends HookConsumerWidget {
//   const MainApp({super.key});

//   @override
//   Widget build(BuildContext context, WidgetRef ref) {
//     final counter = useState(0);
//     final String value = ref.watch(helloWorldProvider);

//     return MaterialApp(
//       home: Scaffold(
//         body: Column(
//           children: [
//             Text('$value ==== ${counter.value}'),
//             Text('$value ==== ${counter.value}'),
//             ChecklistWidget(),
//           ],
//         ),
//       ),
//     );
//   }
// }

void main() {
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: SafeArea(child: InfoPage()));
  }
}
