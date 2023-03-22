import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/models/room.dart';
import 'package:poly_scrabble/services/rooms_service.dart';
import 'package:provider/provider.dart';

import '../../models/user.dart';
import '../message.dart';

class joinRoomTable extends StatefulWidget {
  final List<Room> rooms;
  const joinRoomTable({super.key, required this.rooms});
  static Route get route => MaterialPageRoute(
        builder: (context) => joinRoomTable(
          rooms: Provider.of<RoomService>(context, listen: false).rooms,
        ),
      );

  @override
  State<joinRoomTable> createState() => _joinRoomTableState(rooms: rooms);
}

class _joinRoomTableState extends State<joinRoomTable> {
  final List<Room> rooms;
  List<String> passwords = List<String>.filled(100, '');
  _joinRoomTableState({required this.rooms});

  @override
  Widget build(BuildContext context) {
    return rooms.isEmpty
        ? MessageNotification(text: translate('room.noGames'), isError: true)
        : Column(children: [
            Container(
              child: Row(children: [
                Expanded(
                    child: Column(
                  children: [
                    rooms.isEmpty
                        ? Cell(name: '', isHeader: false)
                        : Cell(
                            name: translate('room.room'),
                            isHeader: true,
                          ),
                    Divider(
                      color:
                          Theme.of(context).textSelectionTheme.selectionColor,
                    ),
                  ],
                )),
                Expanded(
                  child: Column(
                    children: [
                      rooms.isEmpty
                          ? Cell(name: '', isHeader: false)
                          : Cell(
                              name: translate('room.creator'),
                              isHeader: true,
                            ),
                      Divider(
                        color:
                            Theme.of(context).textSelectionTheme.selectionColor,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      rooms.isEmpty
                          ? Cell(name: '', isHeader: false)
                          : Cell(
                              name: translate('room.timer'),
                              isHeader: true,
                            ),
                      Divider(
                        color:
                            Theme.of(context).textSelectionTheme.selectionColor,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      rooms.isEmpty
                          ? Cell(name: '', isHeader: false)
                          : Cell(
                              name: translate('room.nbHumans'),
                              isHeader: true,
                            ),
                      Divider(
                        color:
                            Theme.of(context).textSelectionTheme.selectionColor,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      rooms.isEmpty
                          ? Cell(name: '', isHeader: false)
                          : Cell(
                              name: translate('room.nbBots'),
                              isHeader: true,
                            ),
                      Divider(
                        color:
                            Theme.of(context).textSelectionTheme.selectionColor,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      rooms.isEmpty
                          ? Cell(name: '', isHeader: false)
                          : Cell(
                              name: translate('room.nbObservers'),
                              isHeader: true,
                            ),
                      Divider(
                        color:
                            Theme.of(context).textSelectionTheme.selectionColor,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      rooms.isEmpty
                          ? Cell(name: '', isHeader: false)
                          : Cell(
                              name: translate('room.password'),
                              isHeader: true,
                            ),
                      Divider(
                        color:
                            Theme.of(context).textSelectionTheme.selectionColor,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      rooms.isEmpty
                          ? Cell(name: '', isHeader: false)
                          : Cell(
                              name: translate('room.gameType'),
                              isHeader: true,
                            ),
                      Divider(
                        color:
                            Theme.of(context).textSelectionTheme.selectionColor,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    children: [
                      rooms.isEmpty
                          ? Cell(name: '', isHeader: false)
                          : Cell(
                              name: "",
                              isHeader: true,
                            ),
                      Divider(
                        color:
                            Theme.of(context).textSelectionTheme.selectionColor,
                      ),
                    ],
                  ),
                )
              ]),
            ),
            Container(
              constraints: const BoxConstraints(
                  minHeight: 100, minWidth: 100, maxHeight: 400),
              child: ListView.builder(
                itemCount: rooms.length,
                itemBuilder: (context, index) {
                  // ignore: unused_local_variable
                  final item = rooms[index];
                  return Container(
                    child: Row(children: [
                      Expanded(
                          child: Column(
                        children: [
                          Cell(
                            name: item.roomInfo.name,
                            isHeader: false,
                          ),
                          Divider(
                            color: Theme.of(context)
                                .textSelectionTheme
                                .selectionColor,
                          )
                        ],
                      )),
                      Expanded(
                        child: Column(
                          children: [
                            Cell(
                              name: item.players[0].pseudo,
                              isHeader: false,
                            ),
                            Divider(
                              color: Theme.of(context)
                                  .textSelectionTheme
                                  .selectionColor,
                            )
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          children: [
                            Cell(
                              name: item.roomInfo.timerPerTurn,
                              isHeader: false,
                            ),
                            Divider(
                              color: Theme.of(context)
                                  .textSelectionTheme
                                  .selectionColor,
                            )
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          children: [
                            Cell(
                              name: getNbHumans(item),
                              isHeader: false,
                            ),
                            Divider(
                              color: Theme.of(context)
                                  .textSelectionTheme
                                  .selectionColor,
                            )
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          children: [
                            Cell(
                              name: getNbBots(item),
                              isHeader: false,
                            ),
                            Divider(
                              color: Theme.of(context)
                                  .textSelectionTheme
                                  .selectionColor,
                            )
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          children: [
                            Cell(
                              name: getNbObservers(item),
                              isHeader: false,
                            ),
                            Divider(
                              color: Theme.of(context)
                                  .textSelectionTheme
                                  .selectionColor,
                            )
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          children: [
                            (item.roomInfo.pw != '' && item.roomInfo.isPublic)
                                ? Container(
                                    height: 30,
                                    child: TextField(
                                      onChanged: (text) {
                                        setState(() {
                                          passwords[index] = text;
                                        });
                                      },
                                    ))
                                : Cell(
                                    name: translate('room.none'),
                                    isHeader: false,
                                  ),
                            Divider(
                              color: Theme.of(context)
                                  .textSelectionTheme
                                  .selectionColor,
                            )
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          children: [
                            Cell(
                              name: item.roomInfo.isPublic
                                  ? translate('room.public')
                                  : translate('room.private'),
                              isHeader: false,
                            ),
                            Divider(
                              color: Theme.of(context)
                                  .textSelectionTheme
                                  .selectionColor,
                            )
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          children: [
                            Container(
                                height: 30,
                                child:
                                    item.isGameStarted && item.roomInfo.isPublic
                                        ? observeButton(
                                            password: passwords[index],
                                            room: item)
                                        : joinButton(
                                            password: passwords[index],
                                            room: item)),
                            Divider(
                              color: Theme.of(context)
                                  .textSelectionTheme
                                  .selectionColor,
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

  String getNbBots(Room room) {
    if (room.players.length < 4) return (4 - room.roomInfo.nbHumans).toString();
    return room.nbBots.toString();
  }

  String getNbObservers(Room room) {
    if (room.players.length < 4) return '0';
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return (room.players.length - 4).toString();
  }

  String getNbHumans(Room room) {
    return room.nbHumanPlayers.toString() +
        '/' +
        room.roomInfo.nbHumans.toString();
  }
}

class joinButton extends StatelessWidget {
  final String password;
  final Room room;

  const joinButton({super.key, required this.password, required this.room});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
        style: ButtonStyle(
          backgroundColor: MaterialStateProperty.all(
              (password == room.roomInfo.pw &&
                      !room.isGameStarted &&
                      room.nbHumanPlayers < room.roomInfo.nbHumans)
                  ? const Color(0xFF7daf6b)
                  : const Color.fromARGB(255, 143, 160, 137)),
        ),
        onPressed: () {
          if ((password != room.roomInfo.pw && room.roomInfo.pw != '') ||
              room.isGameStarted ||
              (room.nbHumanPlayers >= room.roomInfo.nbHumans)) {
            return;
          }
          room.currentPlayerPseudo =
              Provider.of<UserModel>(context, listen: false).player.pseudo;
          Provider.of<RoomService>(context, listen: false).currentPlayer =
              Provider.of<UserModel>(context, listen: false).player;
          Provider.of<RoomService>(context, listen: false).askToJoin(
              room, Provider.of<UserModel>(context, listen: false).player);
        },
        child: Text(translate('room.join')));
  }
}

class observeButton extends StatelessWidget {
  final String password;
  final Room room;

  const observeButton({super.key, required this.password, required this.room});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
        style: ButtonStyle(
          backgroundColor: MaterialStateProperty.all(
              (password == room.roomInfo.pw)
                  ? const Color(0xFF7daf6b)
                  : const Color.fromARGB(255, 143, 160, 137)),
        ),
        onPressed: () {
          if (password != room.roomInfo.pw) return;
          room.currentPlayerPseudo =
              Provider.of<UserModel>(context, listen: false).player.pseudo;
          Provider.of<RoomService>(context, listen: false).currentPlayer =
              Provider.of<UserModel>(context, listen: false).player;
          Provider.of<RoomService>(context, listen: false).observeGame(
              room, Provider.of<UserModel>(context, listen: false).player);
        },
        child: Text(translate('room.observe')));
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
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).textSelectionTheme.selectionColor),
              )
            : Text(name));
  }
}
/// The base class for the different types of items the list can contain.
