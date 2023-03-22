import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/user.dart';
import '../../services/chat_service.dart';

class FloatingChatButton extends StatelessWidget {
  const FloatingChatButton({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Consumer<UserModel>(builder: ((context, user, child) {
      return FloatingActionButton(
        heroTag: 'chat',
        onPressed: Provider.of<ChatService>(context).toggleChatVisibility,
        backgroundColor: Theme.of(context).focusColor,
        tooltip: 'Chat',
        child: Provider.of<ChatService>(context).isChatOpen
            ? const Icon(Icons.close)
            : const Icon(Icons.mark_unread_chat_alt),
      ); // This trailing comma makes auto-formatting nicer for build methods.
    }));
  }
}
