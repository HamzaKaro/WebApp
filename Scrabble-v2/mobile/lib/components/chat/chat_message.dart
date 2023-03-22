import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/chat.dart';
import '../../models/user.dart';

class ChatMessage extends StatelessWidget {
  const ChatMessage({
    Key? key,
    required this.message,
  }) : super(key: key);

  final Message message;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        message.avatar != ''
            ? CircleAvatar(
                minRadius: 30,
                backgroundImage: NetworkImage(message.avatar),
              )
            : CircleAvatar(
                minRadius: 30,
                child: Text(message.sender.substring(0, 1).toUpperCase()),
              ),
        Expanded(
          child: (Container(
            margin: const EdgeInsets.all(10),
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: message.sender ==
                      Provider.of<UserModel>(context, listen: false).username
                  ? Theme.of(context).focusColor
                  : Theme.of(context).primaryColor,
              border: Border.all(
                color: Colors.grey,
                width: 2,
              ),
              shape: BoxShape.rectangle,
              borderRadius: BorderRadius.circular(10),
            ),
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(message.sender.isEmpty ? 'Anonymous' : message.sender,
                  style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: message.sender ==
                              Provider.of<UserModel>(context, listen: false)
                                  .username
                          ? Theme.of(context).splashColor
                          : Colors.black)),
              Text(
                message.text,
                style: TextStyle(
                    height: 1.5,
                    color: message.sender ==
                            Provider.of<UserModel>(context, listen: false)
                                .username
                        ? Theme.of(context).splashColor
                        : Colors.black),
              ),
            ]),
          )),
        ),
      ],
    );
  }
}
