import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:poly_scrabble/components/chat/chat_components.dart';
import 'package:poly_scrabble/services/rooms_service.dart';
import 'package:poly_scrabble/widgets/search-definition.dart';
import 'package:poly_scrabble/widgets/tutorial.dart';
import 'package:provider/provider.dart';

import '../../components/game/game_components.dart';
import '../../services/game_service.dart';
import '../../services/services.dart';
import '../../widgets/board_player_widget.dart';
import '../home_screen.dart';

class GameViewPlayerScreen extends StatefulWidget {
  const GameViewPlayerScreen({super.key});

  @override
  State<GameViewPlayerScreen> createState() => _GameViewPlayerScreenState();
}

class _GameViewPlayerScreenState extends State<GameViewPlayerScreen> {
  final Board board = Board();

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        log('Quitting game, leaving room');
        Get.to(() => const HomeScreen());
        Provider.of<RoomService>(context, listen: false).giveUp();
        Provider.of<GameService>(context, listen: false).reset();
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(translate('game.you_quit_game_successfully'))));
        return true;
      },
      child: SizedBox(
        child: SafeArea(
          child: Scaffold(
              body: Stack(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [Sidebar(board: board), board],
                  ),
                  const ChatModal(),
                ],
              ),
              floatingActionButton: const FloatingChatButton()),
        ),
      ),
    );
  }
}

class Sidebar extends StatelessWidget {
  const Sidebar({Key? key, required this.board}) : super(key: key);

  final Board board;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      flex: 2,
      child: SingleChildScrollView(
        child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 45),
            child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: const [
                      Clock(),
                      StockStatus(),
                    ],
                  ),
                  Consumer<RoomService>(builder: (context, roomService, child) {
                    return Column(children: [
                      for (int i = 0;
                          i < roomService.currentRoom.players.length;
                          i++)
                        if (!roomService.currentRoom.players[i].isObserver)
                          PlayerCard(
                            player: roomService.currentRoom.players[i],
                            rack: roomService.racks[i],
                            showRacks: false,
                          )
                    ]);
                  }),
                  ElevatedButton(
                      onPressed: () {
                        showDialog(
                            context: context,
                            builder: (context) => const TutorialWidget());
                      },
                      style: ElevatedButton.styleFrom(
                          minimumSize: const Size(200, 40)),
                      child: Text(translate('homepage.tutorial_button'),
                          style: GoogleFonts.montserrat(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ))),
                  SearchDefinition(),
                  const GiveUpButton(),
                  Actions(board: board)
                ])),
      ),
    );
  }
}

class GiveUpButton extends StatelessWidget {
  const GiveUpButton({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Provider.of<GameService>(context, listen: false).isGameOver
        ? ElevatedButton(
            onPressed: () {
              Get.to(() => const HomeScreen());
              Provider.of<RoomService>(context, listen: false).giveUp();
              Provider.of<GameService>(context, listen: false).reset();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: Text(translate("game.give_up")),
          )
        : ElevatedButton(
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

class Actions extends StatelessWidget {
  const Actions({Key? key, required this.board}) : super(key: key);

  final Board board;

  @override
  Widget build(BuildContext context) {
    onPlay() {
      Provider.of<GameService>(context, listen: false).sendPlacement();
      // TODO : Implement logic for play button
    }

    onSkip() {
      board.returnTilesToEasel();
      Provider.of<GameService>(context, listen: false).sendPass();
      // TODO : Implement logic for skip button
    }

    onExchange() {
      //board.returnTilesToEasel();
      Provider.of<GameService>(context, listen: false).sendExchange();
      // TODO : Implement logic for exchange button
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        GameCommandButton(action: onPlay, title: translate("game.play")),
        GameCommandButton(
            action: onExchange, title: translate("game.exchange")),
        GameCommandButton(action: onSkip, title: translate("game.skip")),
      ],
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
              const Color.fromRGBO(154, 175, 146, 1))),
      onPressed: isPlayerTurn ? action : null,
      child: Text(title),
    );
  }
}
