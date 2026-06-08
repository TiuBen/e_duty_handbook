import 'package:flutter/material.dart';

import '../models/info.dart';
import './info_card.dart';

class InfoCategory extends StatelessWidget {
  final String title;
  final List<Info> infos;

  const InfoCategory({super.key, required this.title, required this.infos});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(14),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        border: Border.all(),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 12),
            child: Text(title, style: const TextStyle(fontSize: 20)),
          ),

          const SizedBox(height: 15),

          ...infos.map((e) => InfoCard(info: e)),
        ],
      ),
    );
  }
}
