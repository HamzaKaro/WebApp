import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/models/invitation.dart';
import 'package:poly_scrabble/models/room.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/services/http/http_user_data.dart';
import 'package:poly_scrabble/services/popup_service.dart';
import 'package:poly_scrabble/services/rooms_service.dart';
import 'package:poly_scrabble/services/socket_service.dart';
import 'package:provider/provider.dart';

import '../services/ friends_service.dart';

class SendInvitationWidget extends StatefulWidget {
  SendInvitationWidget({Key? key}) : super(key: key);
  @override
  SendInvitationState createState() => SendInvitationState();
}

class SendInvitationState extends State<SendInvitationWidget> {
  final TextEditingController friendSearched = TextEditingController();
  var friendsService;
  bool isSwitched = false;
  String dropdownvalue = "light";
  String dropdownvalueEmail = "";
  var user;
  var friendUsername = [];
  var themes = [
    'light',
    'dark',
  ];
  var activeUsers = [];
  var usersInGame = [];
  var statusFriend = [];
  var friendsEmail = [
    'fanilotiana105@gmail.com',
    'fanilotiana106@gmail.com',
    'fanilotiana107@gmail.com'
  ];
  var availableFriendsUsername = [];
  var availableFriendsEmail = [];
  bool hasFriend = true;
  @override
  void initState() {
    user = Provider.of<UserModel>(context, listen: false);
    this.refreshList();
    friendsService = Provider.of<FriendsService>(context, listen: false)
        .activeUsers
        .stream
        .listen((value) {
      log("event: " + value.first);
      activeUsers = value;
      if (activeUsers.isNotEmpty) {
        updateStatusFriend();
      }
      ;
      if (!mounted) return;
      setState(() {});
    });
    Provider.of<FriendsService>(context, listen: false)
        .usersInGame
        .stream
        .listen((value) {
      log("event: " + value.first);
      usersInGame = value;
      if (activeUsers.isNotEmpty) {
        updateStatusFriend();
      }
      ;
      if (!mounted) return;
      setState(() {});
    });

    super.initState();
  }

  Future<void> refresh() async {
    HttpUserData.getFriends(
            Provider.of<UserModel>(context, listen: false).email)
        .then((value) {
      if (value == null) {
        return;
      }
      if (!mounted) return;
      setState(() {
        friendUsername = value;
      });
      return;
    });
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(translate("friend.friend_invitation")),
      content: !hasFriend
          ? Text(translate("friend.no_friend"))
          : Column(mainAxisSize: MainAxisSize.min, children: <Widget>[
              Row(
                children: [
                  DropdownButton(
                    // Initial Value
                    value: dropdownvalue ?? ' ',

                    // Down Arrow Icon
                    icon: const Icon(Icons.keyboard_arrow_down),
                    // Array list of items
                    items: availableFriendsUsername
                        .cast<String>()
                        .map((String items) {
                      return DropdownMenuItem(
                        value: items,
                        child: Text(items),
                      );
                    }).toList(),
                    // After selecting the desired option,it will
                    // change button value to selected value
                    onChanged: (String? newValue) {
                      log("uhuhuhu: " + newValue!);
                      setState(() {
                        dropdownvalue = newValue!;
                        dropdownvalueEmail = getEmail(newValue);
                      });
                    },
                  ),
                  ElevatedButton(
                      onPressed: () {
                        inviteFriend(dropdownvalueEmail, dropdownvalue);
                      },
                      child: Text(translate("friend.invite")))
                ],
              )
            ]),
    );
  }

  String getEmail(String username) {
    var index = 0;
    var result = '';
    for (var value in availableFriendsUsername) {
      if (value == username) {
        result = availableFriendsEmail[index];
        break;
      }
      index++;
    }
    return result;
  }

  getFriends(String email) {
    try {
      HttpUserData.getFriends(user.email).then((value) {
        if (value.isNotEmpty) {
          // PopupService.openErrorPopup(value, context);
          return value as List<String>;
        }
      });
    } catch (e) {
      PopupService.openErrorPopup(e.toString(), context);
      return;
    }
  }

  updateStatusFriend() {
    statusFriend = [];
    for (var value in friendUsername) {
      if (usersInGame.contains(value)) {
        statusFriend.add(translate("friend.friend_status_busy"));
      } else if (activeUsers.contains(value)) {
        statusFriend.add(translate("friend.friend_status_online"));
      } else {
        statusFriend.add(translate("friend.friend_status_offline"));
      }
    }
  }

  refreshList() async {
    await HttpUserData.getFriends(user.email).then((value) async {
      friendUsername = value;
      hasFriend = value.isNotEmpty;
      dropdownvalue = friendUsername.cast<String>().first;

      await HttpUserData.getActiveUsers(user.email).then((value) async {
        activeUsers = value;
        if (activeUsers.isNotEmpty) {
          updateStatusFriend();
        }
        log("activeUsers: " + activeUsers.first);
        // ignore: unnecessary_null_comparison
        if (value == null) {
          setState(() {
            hasFriend = value.isNotEmpty;
          });
          return;
        }
        await HttpUserData.getUsersInGame(user.email).then((userInGame) async {
          if (userInGame == null) {
            usersInGame = [];
            return;
          }
          usersInGame = userInGame;
          if (usersInGame.isNotEmpty) {
            updateStatusFriend();
          }
          filterAvailable();
          dropdownvalue = availableFriendsUsername.cast<String>().first;
        });
        if (!mounted) return;
        setState(() {});
      });
    });
  }

  inviteFriend(String emailReceiver, String usernameReceiver) async {
    var userInfo = Provider.of<UserModel>(context, listen: false);
    var room = Room();
    room = Provider.of<RoomService>(context, listen: false).currentRoom;
    var invitation = Invitation();
    invitation.emailReceiver = emailReceiver;
    invitation.usernameReceiver = usernameReceiver;
    invitation.emailSender = userInfo.email;
    invitation.usernameSender = userInfo.username;
    invitation.room = room;
    Provider.of<SocketService>(context, listen: false)
        .send('send-invitation', invitation);
    Navigator.pop(context);
  }

  filterAvailable() {
    var index = 0;
    for (var value in friendUsername) {
      if (statusFriend[index] == translate("friend.friend_status_online")) {
        log("online");
        availableFriendsUsername.add(value);
        availableFriendsEmail
            .add(Provider.of<UserModel>(context, listen: false).friends[index]);
      }
      index++;
    }
    setState(() {
      hasFriend = availableFriendsEmail.isNotEmpty;
    });
  }
}
