import 'Rack.dart';

class Player {
  late String pseudo;
  late String socketId;
  late int points;
  late bool isCreator;
  late bool isItsTurn;
  late bool isObserver;
  late Rack rack;

  Player() {
    pseudo = 'defaultUser';
    socketId = '';
    points = 0;
    isCreator = false;
    isItsTurn = false;
    isObserver = false;
    rack = Rack();
  }

  Map toJson() => {
        'pseudo': pseudo,
        'socketId': socketId,
        'points': points,
        'isCreator': isCreator,
        'isItsTurn': isItsTurn,
        'isObserver': isObserver,
        'rack': rack.toJson(),
      };
}
