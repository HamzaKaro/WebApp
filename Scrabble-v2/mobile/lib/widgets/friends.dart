import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/services/%20friends_service.dart';
import 'package:poly_scrabble/services/http/http_user_data.dart';
import 'package:poly_scrabble/services/popup_service.dart';
import 'package:poly_scrabble/services/sound_service.dart';
import 'package:provider/provider.dart';

class FriendsPage extends StatefulWidget {
  FriendsPage({Key? key}) : super(key: key);
  final String title = "Settings";

  @override
  _FriendsPageState createState() => _FriendsPageState();
}

class _FriendsPageState extends State<FriendsPage> {
  final TextEditingController friendSearched = TextEditingController();
  var friendsService;
  bool isSwitched = false;
  String dropdownvalue = "light";
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
    return Scaffold(
        appBar: AppBar(
            title: Container(
              width: double.infinity,
              height: 40,
              decoration: BoxDecoration(
                  color: Colors.white, borderRadius: BorderRadius.circular(5)),
              child: Center(
                child: TextField(
                  controller: friendSearched,
                  style: TextStyle(),
                  decoration: InputDecoration(
                      suffixIcon: ElevatedButton.icon(
                        style: ButtonStyle(
                          backgroundColor:
                              MaterialStatePropertyAll<Color>(Colors.blue),
                        ),
                        onPressed: () {
                          /* Clear the search field */
                          addFriend(friendSearched.text);
                          friendSearched.clear();
                        },
                        icon: Icon(
                          // <-- Icon
                          Icons.person_add_alt_1,
                          size: 24.0,
                        ),
                        label: Text(translate("friend.friend_add")), // <-- Text
                      ),
                      hintText: translate("friend.tap_username"),
                      border: InputBorder.none),
                ),
              ),
            ),
            actions: [],
            leading: IconButton(
              icon: Icon(Icons.arrow_back, color: Colors.black),
              onPressed: () => Navigator.of(context).pop(),
            ),
            automaticallyImplyLeading: false),
        body: RefreshIndicator(
            onRefresh: () async {
              await refresh();
              setState(() {});
            },
            child: drawTable()));
  }

  Widget drawTable() {
    return ListView(children: <Widget>[
      Center(
          child: Text(
        translate("friend.see_friend_list"),
        style: TextStyle(fontSize: 25, fontWeight: FontWeight.bold),
      )),
      DataTable(
        columns: [
          DataColumn(
              label: Text(translate("friend.username"),
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
          DataColumn(
              label: Text(translate("friend.status"),
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
          DataColumn(
              label: Text('Action',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
        ],
        rows: [
          for (var i = 0; i < friendUsername.length; i++)
            DataRow(cells: [
              DataCell(Text(
                friendUsername[i],
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              )),
              DataCell(
                Container(
                    child: RichText(
                  text: TextSpan(
                    style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).primaryColorDark),
                    children: [
                      WidgetSpan(
                        child: Padding(
                          padding: EdgeInsets.symmetric(horizontal: 2.0),
                          child: Icon(
                            Icons.radio_button_checked,
                            color: statusFriend.isEmpty
                                ? Theme.of(context)
                                    .textSelectionTheme
                                    .selectionColor
                                : statusFriend[i] ==
                                        translate("friend.friend_status_online")
                                    ? Colors.green
                                    : statusFriend[i] ==
                                            translate(
                                                "friend.friend_status_offline")
                                        ? Theme.of(context)
                                            .textSelectionTheme
                                            .selectionColor
                                        : statusFriend[i] ==
                                                translate(
                                                    "friend.friend_status_busy")
                                            ? Colors.orange
                                            : Colors.red,
                          ),
                        ),
                      ),
                      TextSpan(
                        text: statusFriend.isEmpty
                            ? translate("friend.friend_status_offline")
                            : statusFriend[i],
                        style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context)
                                .textSelectionTheme
                                .selectionColor),
                      ),
                    ],
                  ),
                )),
              ),
              DataCell(
                ElevatedButton.icon(
                  onPressed: () {
                    removeFriend(Provider.of<UserModel>(context, listen: false)
                        .friends[i]);
                  },
                  icon: Icon(
                    // <-- Icon
                    Icons.person_remove_alt_1,
                    size: 24.0,
                  ),
                  style: ButtonStyle(
                    backgroundColor:
                        MaterialStatePropertyAll<Color>(Colors.red),
                  ),
                  label: Text(translate("friend.friend_remove")), // <-- Text
                ),
              )
            ]),
        ],
      ),
    ]);
  }

  switchSoundEffect(bool value) {
    Provider.of<UserModel>(context, listen: false).preferences.soundAnimations =
        value;
    Provider.of<SoundService>(context, listen: false).turnOn = value;
  }

  switchLanguage() {
    var langue =
        Provider.of<UserModel>(context, listen: false).preferences.language;
    if (langue == "en") {
      Provider.of<UserModel>(context, listen: false).setLangue("fr");
      changeLocale(context, "fr");
      setState(() {});
    } else {
      Provider.of<UserModel>(context, listen: false).setLangue("en");
      changeLocale(context, "en");
      setState(() {});
    }
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

  addFriend(String usernameToAdd) async {
    if (usernameToAdd ==
        Provider.of<UserModel>(context, listen: false).username) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(translate("friend.friend_add_yourself")),
        duration: const Duration(seconds: 3),
        action: SnackBarAction(
          label: translate('chat.DISMISS'),
          onPressed: () {
            ScaffoldMessenger.of(context).hideCurrentSnackBar();
          },
        ),
      ));
      return;
    }
    try {
      await HttpUserData.addFriend(
              Provider.of<UserModel>(context, listen: false).email,
              usernameToAdd)
          .then((value) async {
        if (value == "Error") {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(translate("friend.friend_add_error")),
            duration: const Duration(seconds: 3),
            action: SnackBarAction(
              label: translate('chat.DISMISS'),
              onPressed: () {
                ScaffoldMessenger.of(context).hideCurrentSnackBar();
              },
            ),
          ));
        }
        await HttpUserData.getUser(
                Provider.of<UserModel>(context, listen: false).email)
            .then((value) {
          Provider.of<UserModel>(context, listen: false).friends =
              value.friends;
        });
        this.refreshList();
      });
    } catch (e) {
      PopupService.openErrorPopup(e.toString(), context);
      return;
    }
  }

  removeFriend(String emailToRemove) async {
    try {
      await HttpUserData.removeFriend(
              Provider.of<UserModel>(context, listen: false).email,
              emailToRemove)
          .then((value) async {
        if (value.isNotEmpty) {
          PopupService.openErrorPopup(value, context);
        }
        await HttpUserData.getUser(
                Provider.of<UserModel>(context, listen: false).email)
            .then((value) {
          Provider.of<UserModel>(context, listen: false).friends =
              value.friends;
          log("value.friends: " + value.friends.toString());
        });
        this.refreshList();
      });
    } catch (e) {
      PopupService.openErrorPopup(e.toString(), context);
      return;
    }
  }

  void logPreferences() {
    log("Preferences");
    log("Langue: " +
        Provider.of<UserModel>(context, listen: false).preferences.language);
    log("Theme: " +
        Provider.of<UserModel>(context, listen: false).preferences.theme);
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
      if (value == null) {
        return;
      }

      friendUsername = value;
      await HttpUserData.getActiveUsers(user.email).then((value) async {
        activeUsers = value;
        if (activeUsers.isNotEmpty) {
          updateStatusFriend();
        }
        log("activeUsers: " + activeUsers.first);
        if (value == null) {
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
        });
        if (!mounted) return;
        setState(() {});
      });
    });
  }
}
