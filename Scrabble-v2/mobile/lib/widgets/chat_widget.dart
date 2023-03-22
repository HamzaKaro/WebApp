import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/models/models.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/services/chat_service.dart';
import 'package:provider/provider.dart';

import '../components/chat/chat_components.dart';

@immutable
class ChatWidget extends StatelessWidget {
  const ChatWidget({super.key, required this.closeChat});
  final dynamic Function() closeChat;
  @override
  Widget build(BuildContext context) {
    return SafeArea(
        child: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).scaffoldBackgroundColor,
            ),
            child: Provider.of<ChatService>(context, listen: true)
                    .isConversationOpen
                ? SingleConversation(closeChat: closeChat)
                : ConversationsListView(closeChat: closeChat)));
  }
}

class ConversationsListView extends StatelessWidget {
  ConversationsListView({
    Key? key,
    required this.closeChat,
  }) : super(key: key);

  final Function() closeChat;
  final ScrollController _scrollController = ScrollController();

  @override
  Widget build(BuildContext context) {
    return Consumer<ChatService>(builder: (context, chat, child) {
      return Column(children: [
        ConversationListHeader(
            title: translate('chat.chat'), closeChat: closeChat),
        Expanded(
            child: Scrollbar(
          controller: _scrollController,
          child: ListView.builder(
            itemCount: chat.conversations.length,
            itemBuilder: (context, index) {
              return InkWell(
                  onTap: () {
                    Provider.of<ChatService>(context, listen: false)
                        .setOpenConversation(chat.conversations[index].name);
                  },
                  child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Theme.of(context).scaffoldBackgroundColor,
                        border: const Border(),
                      ),
                      child: Text(chat.conversations[index].displayName)));
            },
          ),
        ))
      ]);
    });
  }
}

class SingleConversation extends StatelessWidget {
  SingleConversation({
    Key? key,
    required this.closeChat,
  }) : super(key: key);

  final Function() closeChat;
  final TextEditingController _messageController = TextEditingController();
  final focusNode = FocusNode();
  @override
  Widget build(BuildContext context) {
    void addMessage() {
      if (_messageController.text.trim().isEmpty) return;
      UserModel user = Provider.of<UserModel>(context, listen: false);
      final Message message = Message(
        text: _messageController.text,
        email: user.email,
        sender: user.username,
        avatar: Provider.of<UserModel>(context, listen: false).avatar,
        destination: Provider.of<ChatService>(context, listen: false)
            .openConversation
            .name,
      );
      Provider.of<ChatService>(context, listen: false).sendMessage(message);
      _messageController.clear();
      focusNode.requestFocus();
    }

    return Column(children: [
      SingleConversationHeader(
          title: Provider.of<ChatService>(context, listen: true)
              .openConversation
              .displayName,
          closeChat: closeChat),
      ChatMessagesList(),
      ChatInput(
          addMessage: addMessage,
          messageController: _messageController,
          focusNode: focusNode)
    ]);
  }
}
