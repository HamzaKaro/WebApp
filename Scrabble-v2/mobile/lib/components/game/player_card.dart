import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/components/game/player_easel.dart';
import 'package:poly_scrabble/models/player.dart';
import 'package:provider/provider.dart';

import '../../models/user.dart';
import '../../services/rooms_service.dart';
import '../../services/services.dart';

class PlayerCard extends StatelessWidget {
  const PlayerCard({
    Key? key,
    required this.player,
    required this.rack,
    required this.showRacks,
  }) : super(key: key);

  final Player player;
  final List<String> rack;
  final bool showRacks;

  @override
  Widget build(BuildContext context) {
    dynamic isPlayerTurn() {
      String current =
          Provider.of<GameService>(context, listen: true).currentPlayer;
      return current == player.pseudo;
    }

    return Container(
        padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(5),
          color: isPlayerTurn() ? Colors.green[200] : Colors.white,
          border: Border.all(
            color: Colors.black,
            width: 2,
          ),
        ),
        margin: const EdgeInsets.symmetric(vertical: 7.5),
        child: Column(children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${player.pseudo} ${player.pseudo == Provider.of<UserModel>(context, listen: false).username ? '(vous)' : ''}',
                style: const TextStyle(color: Colors.black),
              ),
              Text(
                '${player.points}',
                style: const TextStyle(color: Colors.black),
              ),
            ],
          ),
          SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              showRacks && player.pseudo.startsWith("bot ")
                  ? ReplaceButton(
                      player: player,
                    )
                  : const SizedBox(),
              if (showRacks) PlayerEasel(rack: rack),
            ],
          ),
        ]));
  }
}

class ReplaceButton extends StatelessWidget {
  final Player player;
  const ReplaceButton({
    Key? key,
    required this.player,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    dynamic isPlayerTurn() {
      String current =
          Provider.of<GameService>(context, listen: true).currentPlayer;
      return current == player.pseudo;
    }

    return ElevatedButton(
      onPressed: () {
        Provider.of<RoomService>(context, listen: false).replaceBot(player);
      },
      child: Text(
        translate("Replace"),
      ),
    );
  }
}
