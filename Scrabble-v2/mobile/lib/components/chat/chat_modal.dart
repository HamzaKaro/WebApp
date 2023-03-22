import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../services/chat_service.dart';
import '../../widgets/chat_widget.dart';

class ChatModal extends StatelessWidget {
  const ChatModal({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Visibility(
      visible: Provider.of<ChatService>(context, listen: false).isChatOpen,
      child: ChatWidget(closeChat: Provider.of<ChatService>(context).closeChat),
    );
  }
}
