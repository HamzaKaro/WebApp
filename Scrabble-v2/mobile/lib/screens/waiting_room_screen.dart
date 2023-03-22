import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:poly_scrabble/components/chat/chat_components.dart';
import 'package:poly_scrabble/components/message.dart';
import 'package:poly_scrabble/components/rooms/pending_players_table.dart';
import 'package:poly_scrabble/components/rooms/waiting_room_table.dart';
import 'package:poly_scrabble/constants/item_nav.dart' as items_nav;
import 'package:poly_scrabble/models/player.dart';
import 'package:poly_scrabble/models/room.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/screens/home_screen.dart';
import 'package:poly_scrabble/services/material_colors_service.dart';
import 'package:poly_scrabble/services/rooms_service.dart';
import 'package:poly_scrabble/services/sound_service.dart';
import 'package:poly_scrabble/widgets/send_invitation.dart';
import 'package:provider/provider.dart';

class WaitingRoomScreen extends StatefulWidget {
  const WaitingRoomScreen({super.key});
  static Route get route => MaterialPageRoute(
        builder: (context) => const WaitingRoomScreen(),
      );
  @override
  State<WaitingRoomScreen> createState() => _WaitingRoomState();
}

class _WaitingRoomState extends State<WaitingRoomScreen> {
  Room room = Room();
  RoomInfo currentRoom = RoomInfo();

  final List<bool> _selectedModeGame = <bool>[true, false];
  bool vertical = false;

  TextEditingController inputLevelGameChosen =
      TextEditingController(text: translate('room.easy'));
  TextEditingController inputTimerPerTurnChosen = TextEditingController();
  TextEditingController inputNumberPlayersChosen = TextEditingController();
  TextEditingController inputPassword = TextEditingController();
  var soundService;
  var userModel;

  void setPassword() {
    currentRoom.pw = inputPassword.text;
  }

  @override
  void initState() {
    inputLevelGameChosen;
    inputTimerPerTurnChosen;
    inputNumberPlayersChosen;
    currentRoom.isPublic = true;
    currentRoom.timerPerTurn = '60';
    currentRoom.nbHumans = 2;
    currentRoom.pw = '';
    currentRoom.levelGame = 'easyLevel';
    userModel = Provider.of<UserModel>(context, listen: false);
    Provider.of<SoundService>(context, listen: false).turnOn =
        userModel.preferences.soundAnimations;
    soundService =
        SoundService(Provider.of<SoundService>(context, listen: false).turnOn);
    super.initState();
  }

  MessageNotification getErrorMessage(bool isRejected, bool isInRoom) {
    return MessageNotification(text: translate('room.wait'), isError: false);
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        log('Quitting waiting room, cancelling room');
        Provider.of<RoomService>(context, listen: false).cancelRoom();
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(translate('room.your_room_was_canceled'))));
        return true;
      },
      child: Center(
        child: Scaffold(
            appBar: AppBar(
              title: Text(translate('room.waiting_room')),
            ),
            body: Center(
              child: Form(
                  child: Stack(
                fit: StackFit.loose,
                children: <Widget>[
                  Container(
                      width: 1000,
                      alignment: Alignment.center,
                      child: SizedBox(child:
                          Consumer<UserModel>(builder: ((context, user, child) {
                        soundService =
                            SoundService(user.preferences.soundAnimations);
                        return Column(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Column(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceEvenly,
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: [
                                    // WARNING MESSAGE //
                                    getErrorMessage(false, true),
                                    // BUTTONS RETURN AND CREATE GAME//
                                    Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        for (var index = 0;
                                            index <
                                                items_nav
                                                    .optionsWaitingRoomGamePage
                                                    .length;
                                            index++)
                                          getOptionButton(index, user)
                                      ],
                                    ),
                                    const SizedBox(
                                      height: 40,
                                    ),
                                    WaitingRoomTable(rooms: [
                                      Provider.of<RoomService>(context,
                                              listen: true)
                                          .currentRoom
                                    ]),
                                    !Provider.of<RoomService>(context,
                                                listen: true)
                                            .currentRoom
                                            .roomInfo
                                            .isPublic
                                        ? pendingPlayersTable(
                                            players: getPendingPlayers(context),
                                            readyToStart:
                                                Provider.of<RoomService>(
                                                        context,
                                                        listen: true)
                                                    .readyToStart,
                                          )
                                        : const SizedBox(
                                            height: 10,
                                          )
                                  ]),
                            ]);
                      })))),
                  const ChatModal()
                ],
              )),
            ),
            floatingActionButton: const FloatingChatButton()),
      ),
    );
  }

  // Create, display and control action of all flutter buttons
  Widget getOptionButton(int index, UserModel user) {
    String namePage = items_nav.optionsWaitingRoomGamePage[index];
    return ElevatedButton(
        onPressed: () {
          switch (namePage) {
            case "room.start":
              Provider.of<RoomService>(context, listen: false).startGame();
              soundService.controllerSound('Selection-options');

              break;
            case "Inviter":
              showDialog(
                  context: context,
                  builder: (context) => SendInvitationWidget());
              soundService.controllerSound('Selection-options');
              break;
            case "room.quit":
              Provider.of<RoomService>(context, listen: false).cancelRoom();
              showDialog(
                  context: context, builder: (context) => const HomeScreen());
              break;
          }
        },
        style: namePage == "room.start"
            ? ElevatedButton.styleFrom(
                minimumSize: const Size(350, 40),
                backgroundColor:
                    Provider.of<RoomService>(context, listen: true).readyToStart
                        ? Colors.green[500]
                        : createMaterialColor(
                            const Color.fromRGBO(154, 175, 146, 1)))
            : ElevatedButton.styleFrom(minimumSize: const Size(350, 40)),
        child: Text(translate(items_nav.optionsWaitingRoomGamePage[index]),
            style: GoogleFonts.montserrat(
              color: namePage == "room.start"
                  ? Provider.of<RoomService>(context, listen: true).readyToStart
                      ? Colors.white
                      : Colors.black
                  : Colors.black,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            )));
  }

  List<Room> getGames(context) {
    return [Provider.of<RoomService>(context).currentRoom];
  }

  List<Player> getPendingPlayers(context) {
    return Provider.of<RoomService>(context, listen: true).pendingPlayers;
  }
}
