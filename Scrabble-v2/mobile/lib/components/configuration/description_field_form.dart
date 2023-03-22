import 'package:flutter/material.dart';

class IconForm extends StatelessWidget {
  final IconData inputIconData;
  const IconForm(this.inputIconData, {super.key});

  @override
  Widget build(BuildContext context) {
    return Expanded(flex: 2, child: Icon(inputIconData));
  }
}

class TitleForm extends StatelessWidget {
  final String inputText;
  const TitleForm(this.inputText, {super.key});

  @override
  Widget build(BuildContext context) {
    return Expanded(
        flex: 16, child: Text(inputText, style: const TextStyle(fontSize: 15)));
  }
}
