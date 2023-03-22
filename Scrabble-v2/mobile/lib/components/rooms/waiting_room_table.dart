import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/models/room.dart';

class WaitingRoomTable extends StatefulWidget {
  final List<Room> rooms;
  const WaitingRoomTable({super.key, required this.rooms});
  static Route get route => MaterialPageRoute(
        builder: (context) => const WaitingRoomTable(
          rooms: [],
        ),
      );

  @override
  State<WaitingRoomTable> createState() => _WaitingRoomTableState(rooms: rooms);
}

class _WaitingRoomTableState extends State<WaitingRoomTable> {
  final List<Room> rooms;
  List<String> passwords = List<String>.filled(100, '');
  _WaitingRoomTableState({required this.rooms});
  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Container(
        child: Row(children: [
          Expanded(
              child: Column(
            children: [
              rooms.isEmpty
                  ? const Cell(name: '', isHeader: false)
                  : Cell(
                      name: translate('room.room'),
                      isHeader: true,
                    ),
              Divider(
                color: Theme.of(context).splashColor,
              ),
            ],
          )),
          Expanded(
            child: Column(
              children: [
                rooms.isEmpty
                    ? const Cell(name: '', isHeader: false)
                    : Cell(
                        name: translate('room.nbHumans'),
                        isHeader: true,
                      ),
                Divider(
                  color: Theme.of(context).splashColor,
                ),
              ],
            ),
          ),
          Expanded(
            child: Column(
              children: [
                rooms.isEmpty
                    ? const Cell(name: '', isHeader: false)
                    : Cell(
                        name: translate('room.creator'),
                        isHeader: true,
                      ),
                Divider(
                  color: Theme.of(context).splashColor,
                ),
              ],
            ),
          ),
          Expanded(
            child: Column(
              children: [
                rooms.isEmpty
                    ? const Cell(name: '', isHeader: false)
                    : Cell(
                        name: translate("room.player") + " 2",
                        isHeader: true,
                      ),
                Divider(
                  color: Theme.of(context).splashColor,
                ),
              ],
            ),
          ),
          Expanded(
            child: Column(
              children: [
                rooms.isEmpty
                    ? const Cell(name: '', isHeader: false)
                    : Cell(
                        name: translate("room.player") + " 3",
                        isHeader: true,
                      ),
                Divider(color: Theme.of(context).splashColor),
              ],
            ),
          ),
          Expanded(
            child: Column(
              children: [
                rooms.isEmpty
                    ? const Cell(name: '', isHeader: false)
                    : Cell(
                        name: translate("room.player") + " 4",
                        isHeader: true,
                      ),
                Divider(
                  color: Theme.of(context).splashColor,
                ),
              ],
            ),
          ),
          Expanded(
            child: Column(
              children: [
                rooms.isEmpty
                    ? const Cell(name: '', isHeader: false)
                    : Cell(
                        name: translate("room.timer"),
                        isHeader: true,
                      ),
                Divider(color: Theme.of(context).splashColor),
              ],
            ),
          ),
          Expanded(
            child: Column(
              children: [
                rooms.isEmpty
                    ? const Cell(name: '', isHeader: false)
                    : Cell(
                        name: translate("room.password"),
                        isHeader: true,
                      ),
                Divider(
                  color: Theme.of(context).splashColor,
                ),
              ],
            ),
          ),
          Expanded(
            child: Column(
              children: [
                rooms.isEmpty
                    ? const Cell(name: '', isHeader: false)
                    : Cell(
                        name: translate("room.gameType"),
                        isHeader: true,
                      ),
                Divider(
                  color: Theme.of(context).splashColor,
                ),
              ],
            ),
          )
        ]),
      ),
      Container(
        constraints:
            const BoxConstraints(minHeight: 100, minWidth: 200, maxHeight: 100),
        child: ListView.builder(
          itemCount: rooms.length,
          itemBuilder: (context, index) {
            final item = rooms[index];
            return Row(children: [
              // ROOM NAME  //
              Expanded(
                  child: Column(
                children: [
                  Cell(
                    // name: Provider.of<RoomService>(context, listen: false)
                    //     .getRoomFromServer(item).,
                    name: item.roomInfo.name,
                    isHeader: false,
                  ),
                  Divider(
                    color: Theme.of(context).splashColor,
                  )
                ],
              )),
              // NUMBER OF HUMAN PLAYERS  //
              Expanded(
                child: Column(
                  children: [
                    Cell(
                      name: item.roomInfo.nbHumans.toString(),
                      isHeader: false,
                    ),
                    Divider(
                      color: Theme.of(context).splashColor,
                    )
                  ],
                ),
              ),
              // CREATOR PLAYER GAME USERNAME  //
              Expanded(
                child: Column(
                  children: [
                    Cell(
                      name: item.players[0].pseudo,
                      isHeader: false,
                    ),
                    Divider(
                      color: Theme.of(context).splashColor,
                    )
                  ],
                ),
              ),
              // PLAYER 2 USERNAME  //
              Expanded(
                child: Column(
                  children: [
                    Cell(
                      // ignore: unnecessary_null_comparison
                      name: item.players.length > 1
                          ? item.players[1].pseudo
                          : '...',
                      isHeader: false,
                    ),
                    Divider(
                      color: Theme.of(context).splashColor,
                    )
                  ],
                ),
              ),
              // PLAYER 3 USERNAME  //
              Expanded(
                child: Column(
                  children: [
                    Cell(
                      name: item.roomInfo.nbHumans == 2
                          ? (item.players.length == 2 ? 'bot' : '...')
                          : item.players.length > 2
                              ? item.players[2].pseudo
                              : '...',
                      isHeader: false,
                    ),
                    Divider(color: Theme.of(context).splashColor)
                  ],
                ),
              ),
              // PLAYER 4 USERNAME  //
              Expanded(
                child: Column(
                  children: [
                    Cell(
                      name: item.roomInfo.nbHumans <= 3
                          ? (item.players.length == item.roomInfo.nbHumans
                              ? 'bot'
                              : '...')
                          : item.players.length > 3
                              ? item.players[3].pseudo
                              : '...',
                      isHeader: false,
                    ),
                    Divider(
                      color: Theme.of(context).splashColor,
                    )
                  ],
                ),
              ),
              // TIME PER TURN  //
              Expanded(
                child: Column(
                  children: [
                    Cell(
                      name: item.roomInfo.timerPerTurn.toString(),
                      isHeader: false,
                    ),
                    Divider(color: Theme.of(context).splashColor)
                  ],
                ),
              ),
              // DICTIONARY NAME  //
              Expanded(
                child: Column(
                  children: [
                    Cell(
                      name: item.roomInfo.pw == ''
                          ? translate("room.none")
                          : item.roomInfo.pw,
                      isHeader: false,
                    ),
                    Divider(
                      color: Theme.of(context).splashColor,
                    )
                  ],
                ),
              ),
              // VISIBILITY GAME //
              Expanded(
                child: Column(
                  children: [
                    Cell(
                      name: item.roomInfo.isPublic
                          ? translate("room.public")
                          : translate("room.private"),
                      isHeader: false,
                    ),
                    Divider(
                      color: Theme.of(context).splashColor,
                    )
                  ],
                ),
              ),
            ]);
          },
        ),
      ),
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
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                ),
              )
            : Text(name));
  }
}
