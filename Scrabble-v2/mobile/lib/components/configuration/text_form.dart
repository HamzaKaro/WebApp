import 'package:flutter/material.dart';

class MainTitle extends StatelessWidget {
  final String inputText;

  const MainTitle(this.inputText, {super.key});

  @override
  Widget build(BuildContext context) {
    return Align(
        child: Text(
      inputText,
      style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold),
    ));
  }
}

class Title extends StatelessWidget {
  final String inputText;

  const Title(this.inputText, {super.key});

  @override
  Widget build(BuildContext context) {
    return Align(
        child: Text(
      inputText,
      style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
    ));
  }
}

class SubTitle extends StatelessWidget {
  final String inputText;

  const SubTitle(this.inputText, {super.key});

  @override
  Widget build(BuildContext context) {
    return Align(
        child: Text(
      inputText,
      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
    ));
  }
}

class SubTitle2 extends StatelessWidget {
  final String inputText;

  const SubTitle2(this.inputText, {super.key});

  @override
  Widget build(BuildContext context) {
    return Align(
        child: Text(
      inputText,
      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
    ));
  }
}

class SubTitle3 extends StatelessWidget {
  final String inputText;

  const SubTitle3(this.inputText, {super.key});

  @override
  Widget build(BuildContext context) {
    return Align(
        alignment: Alignment.centerLeft,
        child: Text(
          inputText,
          style: const TextStyle(fontSize: 15),
        ));
  }
}
