import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/services/rooms_service.dart';
import 'package:provider/provider.dart';

import '../../models/player.dart';
import '../message.dart';

class pendingPlayersTable extends StatefulWidget {
  final List<Player> players;
  final bool readyToStart;
  const pendingPlayersTable(
      {super.key, required this.players, required this.readyToStart});
  static Route get route => MaterialPageRoute(
        builder: (context) => const pendingPlayersTable(
          players: [],
          readyToStart: false,
        ),
      );

  @override
  State<pendingPlayersTable> createState() =>
      _pendingPlayersTableState(players: players, readyToStart: readyToStart);
}

class _pendingPlayersTableState extends State<pendingPlayersTable> {
  final List<Player> players;
  final bool readyToStart;
  List<String> passwords = List<String>.filled(100, '');
  _pendingPlayersTableState(
      {required this.players, required this.readyToStart});

  @override
  Widget build(BuildContext context) {
    return players.isEmpty
        ? MessageNotification(
            text: translate("room.noPlayers"), isError: true)
        : Column(children: [
            Container(
              constraints: const BoxConstraints(
                  minHeight: 100, minWidth: 100, maxHeight: 200),
              child: ListView.builder(
                itemCount: players.length,
                itemBuilder: (context, index) {
                  // ignore: unused_local_variable
                  final item = players[index];
                  return Container(
                    child: Row(children: [
                      Expanded(
                          child: Column(
                        children: [
                          Cell(
                            name: item.pseudo,
                            isHeader: false,
                          ),
                          const Divider(
                            color: Colors.black,
                          )
                        ],
                      )),
                      Expanded(
                        child: Column(
                          children: [
                            Container(
                              height: 30,
                              child: ElevatedButton(
                                  style: ButtonStyle(
                                    backgroundColor: MaterialStateProperty.all(
                                        (!readyToStart)
                                            ? const Color(0xFF7daf6b)
                                            : const Color.fromARGB(
                                                255, 143, 160, 137)),
                                  ),
                                  onPressed: () {
                                    if (readyToStart) return;
                                    Provider.of<RoomService>(context,
                                            listen: false)
                                        .sendAcceptPlayer(item);
                                  },
                                  child: Text(translate("room.accept"))),
                            ),
                            const Divider(
                              color: Colors.black,
                            )
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          children: [
                            Container(
                              height: 30,
                              child: ElevatedButton(
                                  style: ButtonStyle(
                                    backgroundColor: MaterialStateProperty.all(
                                        (!readyToStart)
                                            ? Color.fromARGB(255, 227, 89, 76)
                                            : Color.fromARGB(
                                                255, 162, 127, 123)),
                                  ),
                                  onPressed: () {
                                    if (readyToStart) return;
                                    Provider.of<RoomService>(context,
                                            listen: false)
                                        .sendRejectPlayer(item);
                                  },
                                  child: Text(translate("room.reject"))),
                            ),
                            const Divider(
                              color: Colors.black,
                            )
                          ],
                        ),
                      )
                    ]),
                  );
                },
              ),
            )
          ]);
  }
}

class Cell extends StatelessWidget {
  final String name;
  final bool isHeader;

  const Cell({super.key, required this.name, required this.isHeader});

  @override
  Widget build(BuildContext context) {
    return Container(
        height: 30,
        child: isHeader
            ? Text(
                name,
                style: const TextStyle(
                    fontWeight: FontWeight.bold, color: Colors.black),
              )
            : Text(name));
  }
}
/// The base class for the different types of items the list can contain.
