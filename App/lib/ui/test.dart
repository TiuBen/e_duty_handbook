import 'package:flutter/material.dart';

class Test1 extends StatelessWidget {
  const Test1({super.key});
  @override
  Widget build(BuildContext context) {
    return Container(
        padding: const EdgeInsets.all(8.0),
        decoration: BoxDecoration(
          color: Colors.yellow,
          border: Border.all(color: Colors.black),
        ),
      child: Row(children: [Text("1"), Text("2"), Text("3"),Text("5")]));
  }
}
