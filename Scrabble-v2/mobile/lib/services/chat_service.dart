import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:poly_scrabble/models/models.dart';
import 'package:poly_scrabble/services/socket_service.dart';

import '../models/user.dart';

var noConversation = Conversation(
    name: '',
    messages: [],
    isPublic: true,
    creator: '',
    canBeDeleted: false,
    canBeLeft: false,
    displayName: '');

class ChatService extends ChangeNotifier {
  final List<Message> _messages = [];
  final SocketService socketService;
  final UserModel _userModel;
  List<Message> get messages => _messages;
  // ignore: prefer_final_fields
  List<Conversation> _conversations = [
    Conversation(
        name: 'General',
        messages: [],
        isPublic: true,
        creator: 'system@scrabble.com',
        canBeDeleted: false,
        canBeLeft: false,
        displayName: 'General'),
  ];
  final List<Channel> availableChannels = [];
  bool _isChatOpen = false;

  set isChatOpen(bool value) {
    _isChatOpen = value;
    notifyListeners();
  }

  void closeChat() {
    _isChatOpen = false;
    notifyListeners();
  }

  void toggleChatVisibility() {
    _isChatOpen = !_isChatOpen;
    notifyListeners();
  }

  bool get isChatOpen => _isChatOpen;

  Conversation openConversation = noConversation;
  bool isConversationOpen = false;
  setOpenConversation(String name) {
    openConversation =
        _conversations.firstWhere((element) => element.name == name);
    isConversationOpen = true;

    notifyListeners();
  }

  closeOpenRoom() {
    openConversation = noConversation;
    isConversationOpen = false;
    notifyListeners();
  }

  List<Conversation> get conversations {
    _conversations.sort((a, b) {
      return b.lastActive.compareTo(a.lastActive);
    });
    return _conversations;
  }

  ChatService(this.socketService, this._userModel) {
    setSocketListeners();
  }

  void reset() {
    _conversations = [
      Conversation(
          name: 'General',
          messages: [],
          isPublic: true,
          creator: 'system@scrabble.com',
          canBeDeleted: false,
          canBeLeft: false,
          displayName: 'General'),
    ];
    _messages.clear();
    openConversation = noConversation;
    isConversationOpen = false;
    availableChannels.clear();
    notifyListeners();
  }

  void getUserChannels() {
    socketService.send('get-user-channels', {'email': _userModel.email});
  }

  /* **************** CHANNELS HANDLING **************** */
  void createChannel(name) {
    socketService.send('create-channel', {
      'name': name,
      'creator': _userModel.email,
      'isPublic': true,
    });
  }

  void deleteChannel() {
    Map data = {"name": openConversation.name, "email": _userModel.email};
    socketService.send('delete-channel', data);
    closeChannel();
  }

  void joinChannel(String name) {
    Map data = {"name": name, "email": _userModel.email};
    socketService.send('join-channel', data);
    availableChannels.clear();
  }

  void leaveChannel() {
    Map data = {"name": openConversation.name, "email": _userModel.email};
    socketService.send('leave-channel', data);
  }

  void getAvailableChannels() {
    socketService.send('get-channels-list', null);
  }

  void closeChannel() {
    openConversation = noConversation;
    isConversationOpen = false;
    notifyListeners();
  }

  void createPrivateConversation(friendUsername) {
    Map data = {
      "email": _userModel.email,
      "friendUsername": friendUsername,
    };
    socketService.send('create-private-conversation', data);
  }

  /* **************** MESSAGES HANDLING **************** */

  void setSocketListeners() {
    socketService.on('message', (data) {
      try {
        if (data['destination'] == null) return;
        Conversation? conversation = _conversations.firstWhere((element) {
          return element.name.compareTo(data['destination']) == 0;
        }, orElse: () => noConversation);

        if (conversation.name == noConversation.name) return;
        conversation.messages.add(Message(
          text: data['text'] ?? "",
          sender: data['sender'] ?? "",
          email: data['email'] ?? "",
          avatar: data['avatar'] ?? "",
          destination: data['destination'] ?? "",
        ));
        conversation.lastActive = DateTime.now();
        notifyListeners();
      } catch (e) {
        log(e.toString());
      }
    });

    List<Message> messagesFromJSON(List<dynamic> messages) {
      List<Message> messagesList = [];
      for (var message in messages) {
        messagesList.add(Message(
          text: message['text'],
          sender: message['sender'],
          email: message['email'] ?? "",
          avatar: message['avatar'] ?? "",
          destination: message['destination'],
        ));
      }
      return messagesList;
    }

    socketService.on('get-user-channels', (data) {
      try {
        if (data == null) return;
        data.forEach((element) {
          _conversations.add(Conversation(
            name: element['name'],
            messages: messagesFromJSON(element['messages']),
            isPublic: element['isPublic'],
            creator: element['creator'],
            canBeDeleted: element['canBeDeleted'] ?? true,
            canBeLeft: element['canBeLeft'] ?? true,
            displayName: element['displayName'] ?? element['name'],
          ));
        });
        notifyListeners();
      } catch (e) {
        log('Error while getting user channels: $e');
      }
    });

    socketService.on('get-channels-list', (channels) {
      try {
        for (var channel in channels) {
          Conversation existingElement = _conversations.firstWhere(
            (element) => element.name == channel['name'],
            orElse: () => noConversation,
          );
          if (existingElement.name == noConversation.name) {
            availableChannels.add(Channel(name: channel['name']));
          }
        }
        notifyListeners();
      } catch (e) {
        log("Error while receiving available channels ${e.toString()}");
      }
    });

    socketService.on('create-channel', (data) {
      try {
        if (data['code'] == 200) {
          notifyListeners();
        } else if (data['code'] == 400) {
          log('Channel $data already exists');
        }
      } catch (e) {
        log("Error while receiving result of create channel ${e.toString()}");
      }
    });
    socketService.on('leave-channel', (data) {
      try {
        if (data['code'] == 200) {
          _conversations
              ?.firstWhere((element) {
                return element.name.compareTo(data['name']) == 0;
              })
              .messages
              .clear();
          _conversations.removeWhere((element) => element.name == data['name']);
          closeChannel();
          notifyListeners();
        }
      } catch (e) {
        log("Error while receiving result of leave channel ${e.toString()}");
      }
    });

    socketService.on('delete-channel', (data) {
      try {
        if (data['code'] == 200) {
          _conversations.removeWhere((element) => element.name == data['name']);
          closeChannel();
        }
      } catch (e) {
        log("Error while receiving result of delete channel ${e.toString()}");
      }
    });
    socketService.on('join-channel', (data) {
      try {
        if (data['code'] == 200) {
          _conversations.add(Conversation.fromJSON(data));
          notifyListeners();
        }
      } catch (e) {
        log("Error while receiving result of join channel ${e.toString()}");
      }
    });
  }

  void sendMessage(Message message) {
    socketService.send('message', message.toJSON());
  }
}
