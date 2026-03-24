import 'package:flutter/material.dart';

class HandoverConfig {
  final Color normalColor;
  final Color importantColor;
  final Color confirmedOverlay;
  final Color borderColor;

  final bool enableVoice;
  final bool enableSlideConfirm;

  const HandoverConfig({
    required this.normalColor,
    required this.importantColor,
    required this.confirmedOverlay,
    required this.borderColor,
    this.enableVoice = true,
    this.enableSlideConfirm = true,
  });
}