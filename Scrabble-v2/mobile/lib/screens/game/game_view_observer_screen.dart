import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:get/get.dart';
import 'package:poly_scrabble/components/chat/chat_components.dart';
import 'package:poly_scrabble/services/rooms_service.dart';
import 'package:poly_scrabble/widgets/search-definition.dart';
import 'package:provider/provider.dart';

import '../../components/game/game_components.dart';
import '../../services/game_service.dart';
import '../../services/services.dart';
import '../../widgets/board_observer_widget.dart';
import '../home_screen.dart';

class GameViewObserverScreen extends StatefulWidget {
  const GameViewObserverScreen({super.key});

  @override
  State<GameViewObserverScreen> createState() => _GameViewObserverScreen();
}

class _GameViewObserverScreen extends State<GameViewObserverScreen> {
  final BoardObserver board = BoardObserver();

  @override
  Widget build(BuildContext context) {
    Provider.of<RoomService>(context, listen: false).sendFetchBoard();

    return SizedBox(
      child: SafeArea(
        child: Scaffold(
            body: Stack(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [const Sidebar(), board], //
                ),
                const ChatModal(),
              ],
            ),
            floatingActionButton: const FloatingChatButton()),
      ),
    );
  }
}

class Sidebar extends StatelessWidget {
  const Sidebar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        log('Quitting observer game room');
        Get.to(() => const HomeScreen());
        Provider.of<RoomService>(context, listen: false).giveUp();
        Provider.of<GameService>(context, listen: false).reset();
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(translate('game.you_quit_game_successfully'))));
        return true;
      },
      child: Expanded(
        flex: 2,
        child: SingleChildScrollView(
          child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 25),
              child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Clock(),
                        const StockStatus(),
                      ],
                    ),
                    Consumer<RoomService>(
                        builder: (context, roomService, child) {
                      return Column(children: [
                        for (int i = 0;
                            i < roomService.currentRoom.players.length;
                            i++)
                          if (!roomService.currentRoom.players[i].isObserver)
                            PlayerCard(
                                player: roomService.currentRoom.players[i],
                                rack: roomService.racks[i],
                                showRacks: true)
                      ]);
                    }),
                    SearchDefinition(),
                    QuitButton()
                  ])),
        ),
      ),
    );
  }
}

class StockStatus extends StatelessWidget {
  const StockStatus({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(5),
        border: Border.all(
          color: Colors.black,
          width: 2,
        ),
      ),
      child: Consumer<GameService>(builder: (context, game, child) {
        return Text('${game.remainingLetters} lettres',
            style: const TextStyle(fontSize: 24, color: Colors.black));
      }),
    );
  }
}

class GameCommandButton extends StatelessWidget {
  const GameCommandButton(
      {super.key, required this.action, required this.title});
  final dynamic Function() action;
  final String title;

  @override
  Widget build(BuildContext context) {
    bool isPlayerTurn =
        Provider.of<GameService>(context, listen: true).isConnectedPlayerTurn();
    return ElevatedButton(
      style: ButtonStyle(
          padding: MaterialStateProperty.all(
              const EdgeInsets.symmetric(horizontal: 20, vertical: 10)),
          backgroundColor: MaterialStateProperty.all(
              const Color.fromRGBO(235, 194, 147, 1))),
      onPressed: isPlayerTurn ? action : null,
      child: Text(title),
    );
  }
}

class QuitButton extends StatelessWidget {
  const QuitButton({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        Get.to(() => const HomeScreen());
        Provider.of<RoomService>(context, listen: false).giveUp();
        Provider.of<GameService>(context, listen: false).reset();
      },
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.red,
      ),
      child: Text(translate("game.quit")),
    );
  }
}
