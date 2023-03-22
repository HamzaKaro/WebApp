import 'package:flutter/material.dart';

class MessageNotification extends StatelessWidget {
  final String text;
  final bool isError;

  const MessageNotification(
      {super.key, required this.text, required this.isError});

  @override
  Widget build(BuildContext context) {
    return Container(
        width: 600.0,
        height: 30.0,
        margin: const EdgeInsets.all(15.0),
        padding: const EdgeInsets.all(3.0),
        decoration: BoxDecoration(
          border: Border.all(
              color: isError ? Color(0xFFc86665) : Color(0xff1952a7)),
          color: isError ? Color(0xFFecc8c5) : Color.fromRGBO(216, 227, 250, 1),
        ),
        child: Row(
          children: [
            const Expanded(
              flex: 1,
              child: Text("( ! )", style: TextStyle(color: Colors.black)),
            ),
            const Expanded(
              flex: 2,
              child: Text(""),
            ),
            Expanded(
              flex: 8,
              child: Text(
                text,
                style: TextStyle(color: Colors.black),
              ),
            )
          ],
        ));
  }
}
/// The base class for the different types of items the list can contain.