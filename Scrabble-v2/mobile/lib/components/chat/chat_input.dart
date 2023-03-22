import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';

class ChatInput extends StatelessWidget {
  const ChatInput({
    Key? key,
    required TextEditingController messageController,
    required this.addMessage,
    required this.focusNode,
  })  : _messageController = messageController,
        super(key: key);

  final Function() addMessage;
  final TextEditingController _messageController;
  final FocusNode focusNode;
  @override
  Widget build(BuildContext context) {
    return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
        child: TextField(
          controller: _messageController,
          onEditingComplete: addMessage,
          focusNode: focusNode,
          decoration: InputDecoration(
              border: const OutlineInputBorder(),
              labelText: translate('chat.type_message'),
              hintText: translate('chat.type_message'),
              enabledBorder: OutlineInputBorder(
                borderSide: BorderSide(
                    width: 3,
                    color: Theme.of(context).focusColor), //<-- SEE HERE
              ),
              suffixIcon: Padding(
                  padding: const EdgeInsets.only(right: 20),
                  child: TextButton(
                      onPressed: addMessage, child: const Icon(Icons.send)))),
        ));
  }
}
