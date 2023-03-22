// import 'package:dropdown_button2/dropdown_button2.dart';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/services/http/http_user_data.dart';
import 'package:provider/provider.dart';

import '../../services/chat_service.dart';

class ConversationListHeader extends StatelessWidget {
  const ConversationListHeader(
      {Key? key, required this.closeChat, required this.title})
      : super(key: key);

  final dynamic Function() closeChat;
  final String title;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        border: Border(bottom: BorderSide(color: Colors.grey[300]!, width: 1)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const SizedBox(),
          Text(
            title,
            style: const TextStyle(fontSize: 25, fontWeight: FontWeight.bold),
          ),
          ElevatedButton(
            onPressed: () {
              showDialog(
                  context: context,
                  builder: (BuildContext context) {
                    return const ConversationListDialogMenu();
                  });
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              shape: const CircleBorder(),
              padding: const EdgeInsets.all(5),
            ),
            child: const Icon(Icons.more_horiz, color: Colors.black),
          ),
        ],
      ),
    );
  }
}

class CreateChannelDialog extends StatelessWidget {
  CreateChannelDialog({
    Key? key,
  }) : super(key: key);

  final TextEditingController nameController = TextEditingController();
  final formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Form(
        key: formKey,
        child: AlertDialog(
          title: Text(translate('chat.create_channel')),
          content: TextFormField(
            controller: nameController,
            decoration: InputDecoration(
              border: const OutlineInputBorder(),
              labelText: translate('chat.channel_name'),
              hintText: translate('chat.type_chanel_name'),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return translate('chat.error.empty_channel_name');
              } else if (value.length > 20) {
                return translate('chat.error.channel_name_too_long');
              } else if (value == 'General') {
                return translate('chat.error.channel_cant_be_general');
              } else if (value.startsWith('MP:')) {
                return translate('chat.error.channel_cant_start_with_MP');
              }
              return null;
            },
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text(translate('actions.cancel')),
            ),
            TextButton(
              onPressed: () {
                if (formKey.currentState!.validate()) {
                  Provider.of<ChatService>(context, listen: false)
                      .createChannel(nameController.text);
                  Navigator.of(context).pop();

                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text(translate('chat.channel_was_created', args: {
                      'channel': nameController.text,
                    })),
                    duration: const Duration(seconds: 3),
                    action: SnackBarAction(
                      label: translate('chat.DISMISS'),
                      onPressed: () {
                        ScaffoldMessenger.of(context).hideCurrentSnackBar();
                      },
                    ),
                  ));
                }
              },
              child: Text(translate('actions.create')),
            ),
          ],
        ));
  }
}

class SingleConversationDialog extends StatelessWidget {
  const SingleConversationDialog({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    canUserDeleteChanel() {
      final user = Provider.of<UserModel>(context, listen: false);
      final chatService = Provider.of<ChatService>(context, listen: false);
      if (!chatService.openConversation.canBeDeleted) return false;
      return user.email == chatService.openConversation.creator;
    }

    canUserLeaveChanel() {
      final user = Provider.of<UserModel>(context, listen: false);
      final chatService = Provider.of<ChatService>(context, listen: false);
      if (!chatService.openConversation.canBeLeft) return false;
      return user.email != chatService.openConversation.creator;
    }

    var disabledStyle = Theme.of(context).disabledColor;
    var normalStyle = Theme.of(context).textTheme.bodyText1!.color;

    return SimpleDialog(
      children: [
        SimpleDialogOption(
          onPressed: canUserLeaveChanel()
              ? () {
                  Provider.of<ChatService>(context, listen: false)
                      .leaveChannel();
                  Navigator.of(context).pop();
                }
              : null,
          child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 10),
              child: Wrap(
                  spacing: 10,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Icon(Icons.directions_run,
                        color:
                            canUserLeaveChanel() ? normalStyle : disabledStyle),
                    Text(translate('chat.leave_channel'),
                        style: TextStyle(
                            color: canUserLeaveChanel()
                                ? normalStyle
                                : disabledStyle))
                  ])),
        ),
        SimpleDialogOption(
            onPressed: canUserDeleteChanel()
                ? () {
                    Provider.of<ChatService>(context, listen: false)
                        .deleteChannel();
                    Navigator.of(context).pop();
                  }
                : null,
            child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 5, vertical: 10),
                child: Wrap(
                    spacing: 10,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Icon(Icons.delete,
                          color: canUserDeleteChanel()
                              ? normalStyle
                              : disabledStyle),
                      Text(translate('chat.delete_channel'),
                          style: TextStyle(
                              color: canUserDeleteChanel()
                                  ? normalStyle
                                  : disabledStyle))
                    ]))),
      ],
    );
  }
}

class CreatePrivateConversationDialog extends StatefulWidget {
  const CreatePrivateConversationDialog({
    Key? key,
  }) : super(key: key);

  @override
  State<CreatePrivateConversationDialog> createState() =>
      _CreatePrivateConversationDialogState();
}

class _CreatePrivateConversationDialogState
    extends State<CreatePrivateConversationDialog> {
  final TextEditingController usernameController = TextEditingController();
  final formKey = GlobalKey<FormState>();
  String filterText = "";
  List<String> friends = [];

  @override
  void initState() {
    super.initState();

    try {
      var user = Provider.of<UserModel>(context, listen: false);
      HttpUserData.getFriends(user.email).then((value) {
        setState(() {
          friends = value;
        });
      });
    } catch (e) {
      log(e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    var filtered = filterText.isNotEmpty
        ? friends.where((element) => element.startsWith(filterText)).toList()
        : friends;
    return AlertDialog(
        title: Text(translate("chat.create_private_conversation")),
        content: SizedBox(
            height: 300,
            width: 600,
            child: Column(children: [
              TextField(
                controller: usernameController,
                onChanged: (value) {
                  setState(() {
                    filterText = value;
                  });
                },
                decoration: InputDecoration(
                  border: const OutlineInputBorder(),
                  labelText: "${translate('actions.filter')}...",
                  hintText: "${translate('actions.filter')}...",
                ),
              ),
              Expanded(
                child: Scrollbar(
                    child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: filtered.length,
                        itemBuilder: (context, index) {
                          return SimpleDialogOption(
                            onPressed: () {
                              Provider.of<ChatService>(context, listen: false)
                                  .createPrivateConversation(filtered[index]);
                              Navigator.of(context).pop();
                            },
                            child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 2, vertical: 10),
                                child: Wrap(
                                    spacing: 10,
                                    crossAxisAlignment:
                                        WrapCrossAlignment.center,
                                    children: [
                                      const Icon(Icons.add),
                                      Text(filtered[index])
                                    ])),
                          );
                        })),
              )
            ])));
  }
}

class AvailableChannelsListDialog extends StatefulWidget {
  const AvailableChannelsListDialog({
    Key? key,
  }) : super(key: key);

  @override
  State<AvailableChannelsListDialog> createState() =>
      _AvailableChannelsListDialogState();
}

class _AvailableChannelsListDialogState
    extends State<AvailableChannelsListDialog> {
  final TextEditingController nameController = TextEditingController();
  final formKey = GlobalKey<FormState>();
  String filterText = "";
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
        title: Text(translate("chat.available_channels")),
        content: SizedBox(
          height: 300,
          width: 600,
          child: Consumer<ChatService>(builder: (context, chatService, child) {
            var filtered = filterText.isNotEmpty
                ? chatService.availableChannels
                    .where((element) => element.name.startsWith(filterText))
                    .toList()
                : chatService.availableChannels;
            return Column(children: [
              TextField(
                controller: nameController,
                onChanged: (value) {
                  setState(() {
                    filterText = value;
                  });
                },
                decoration: InputDecoration(
                  border: const OutlineInputBorder(),
                  labelText: "${translate('actions.filter')}...",
                  hintText: "${translate('actions.filter')}...",
                ),
              ),
              Expanded(
                child: Scrollbar(
                    child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: filtered.length,
                        itemBuilder: (context, index) {
                          return SimpleDialogOption(
                            onPressed: () {
                              chatService.joinChannel(filtered[index].name);
                              Navigator.of(context).pop();
                            },
                            child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 2, vertical: 10),
                                child: Wrap(
                                    spacing: 10,
                                    crossAxisAlignment:
                                        WrapCrossAlignment.center,
                                    children: [
                                      const Icon(Icons.add),
                                      Text(filtered[index].name)
                                    ])),
                          );
                        })),
              )
            ]);
          }),
        ));
  }
}

class ConversationListDialogMenu extends StatelessWidget {
  const ConversationListDialogMenu({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SimpleDialog(
      children: [
        SimpleDialogOption(
          onPressed: () {
            Navigator.of(context).pop();
            showDialog(
                context: context,
                builder: (BuildContext context) {
                  return CreateChannelDialog();
                });
          },
          child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 10),
              child: Wrap(
                  spacing: 10,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    const Icon(Icons.add),
                    Text(translate('chat.create_channel'))
                  ])),
        ),
        SimpleDialogOption(
          onPressed: () {
            Navigator.of(context).pop();
            showDialog(
                context: context,
                builder: (BuildContext context) {
                  return const CreatePrivateConversationDialog();
                });
          },
          child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 10),
              child: Wrap(
                  spacing: 10,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    const Icon(Icons.add),
                    Text(translate('chat.create_private_conversation'))
                  ])),
        ),
        SimpleDialogOption(
            onPressed: () {
              Navigator.of(context).pop();
              Provider.of<ChatService>(context, listen: false)
                  .getAvailableChannels();
              showDialog(
                  context: context,
                  builder: (BuildContext context) {
                    return const AvailableChannelsListDialog();
                  });
            },
            child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 5, vertical: 10),
                child: Wrap(
                    spacing: 10,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      const Icon(Icons.people),
                      Text(translate('chat.join_channel'))
                    ]))),
      ],
    );
  }
}

class SingleConversationHeader extends StatelessWidget {
  const SingleConversationHeader(
      {Key? key, required this.closeChat, required this.title})
      : super(key: key);

  final dynamic Function() closeChat;
  final String title;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        border: Border(bottom: BorderSide(color: Colors.grey[300]!, width: 1)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          ElevatedButton(
            onPressed: () {
              Provider.of<ChatService>(context, listen: false).closeOpenRoom();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              shape: const CircleBorder(),
              padding: const EdgeInsets.all(5),
            ),
            child: const Icon(Icons.arrow_back, color: Colors.black),
          ),
          Text(
            title,
            style: const TextStyle(fontSize: 25, fontWeight: FontWeight.bold),
          ),
          ElevatedButton(
            onPressed: () {
              showDialog(
                  context: context,
                  builder: (BuildContext context) {
                    return const SingleConversationDialog();
                  });
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              shape: const CircleBorder(),
              padding: const EdgeInsets.all(5),
            ),
            child: const Icon(Icons.more_horiz, color: Colors.black),
          ),
        ],
      ),
    );
  }
}
