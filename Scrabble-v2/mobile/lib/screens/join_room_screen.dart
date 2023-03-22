import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/components/chat/chat_components.dart';
import 'package:poly_scrabble/components/rooms/join_room_table.dart';
import 'package:poly_scrabble/screens/screens.dart';
import 'package:provider/provider.dart';

import '../../models/user.dart';
import '../components/buttons/return.dart';
import '../components/message.dart';
import '../models/room.dart';
import '../services/rooms_service.dart';

class JoinRoomScreen extends StatefulWidget {
  const JoinRoomScreen({super.key});
  static Route get route => MaterialPageRoute(
        builder: (context) => const JoinRoomScreen(),
      );

  @override
  State<JoinRoomScreen> createState() => _JoinRoomState();
}

class _JoinRoomState extends State<JoinRoomScreen> {
  String errorMessage = '';

  MessageNotification getErrorMessage(
      bool isRejected, bool isPending, bool isInRoom) {
    if (isRejected) {
      return MessageNotification(
          text: translate('room.rejected'), isError: true);
    }
    if (isInRoom) {
      return MessageNotification(text: translate('room.wait'), isError: false);
    }
    if (isPending) {
      return MessageNotification(
          text: translate('room.waitForConfirmation'), isError: false);
    }

    return MessageNotification(
        text: translate('room.chooseGame'), isError: false);
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        log('Room left when exiting joiningRoomScreen');
        Provider.of<RoomService>(context, listen: false).leaveRoom();
        return true;
      },
      child: Scaffold(
          appBar: AppBar(
            title: Text(translate('room.joiningRoom')),
            // Disable back button in the AppBar
          ),
          body: Center(
            child: SingleChildScrollView(
              child: SizedBox(
                width: 1000,
                child: Stack(
                  fit: StackFit.loose,
                  children: <Widget>[
                    Container(
                        alignment: Alignment.center,
                        child: SizedBox(
                            width: 800,
                            child: Consumer<UserModel>(
                                builder: ((context, user, child) {
                              return Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    translate('room.joiningRoom'),
                                    style: TextStyle(fontSize: 50),
                                  ),
                                  SizedBox(height: 50),
                                  Text(
                                    translate('room.availableGames'),
                                    style: TextStyle(fontSize: 20),
                                  ),
                                  SizedBox(height: 30),
                                  getErrorMessage(
                                      Provider.of<RoomService>(context,
                                              listen: false)
                                          .isRejected,
                                      Provider.of<RoomService>(context,
                                              listen: false)
                                          .isPending,
                                      Provider.of<RoomService>(context,
                                              listen: false)
                                          .isInRoom),
                                  // if (!Provider.of<RoomService>(context,
                                  //         listen: false)
                                  //     .isInRoom)
                                  if (!Provider.of<RoomService>(context,
                                              listen: true)
                                          .isInRoom &&
                                      !Provider.of<RoomService>(context,
                                              listen: true)
                                          .isPending)
                                    joinRoomTable(rooms: getGames(context)),
                                  ReturnButton(route: HomeScreen.route)
                                ],
                              );
                            })))),
                    const ChatModal(),
                  ],
                ),
              ),
            ),
          ),
          floatingActionButton: const FloatingChatButton()),
    );
  }

  List<Room> getGames(context) {
    return Provider.of<RoomService>(context, listen: true).rooms;
  }
}
