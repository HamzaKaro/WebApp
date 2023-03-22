import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:provider/provider.dart';

import '../../services/chat_service.dart';
import 'chat_message.dart';

class ChatMessagesList extends StatelessWidget {
  ChatMessagesList({
    Key? key,
  }) : super(key: key);

  final ScrollController _scrollController = ScrollController();
  final lastKey = GlobalKey();

  void _scrollToBottom() async {
    if (_scrollController.hasClients &&
        _scrollController.position.hasContentDimensions) {
      await _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut);
      if (lastKey.currentContext != null) {
        Scrollable.ensureVisible(lastKey.currentContext!);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    SchedulerBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom();
    });
    return Consumer<ChatService>(builder: (context, chat, child) {
      return Expanded(
          child: Scrollbar(
        controller: _scrollController,
        child: ListView.builder(
            padding: const EdgeInsets.all(8),
            controller: _scrollController,
            itemCount: chat.openConversation.messages.length,
            itemBuilder: (context, index) {
              final message = chat.openConversation.messages[index];
              return ChatMessage(
                message: message,
                key: index == chat.openConversation.messages.length - 1
                    ? lastKey
                    : null,
              );
            }),
      ));
    });
  }
}
