import 'player.dart';

class RoomInfo {
  late String name;
  late String levelGame;
  late String timerPerTurn;
  late String dictionary;
  late String gameType;
  late int maxPlayers;
  late bool isGameOver;
  late int nbHumans;
  late bool isPublic;
  late String pw;
}

class JoinInterface {
  late String roomName;
  late Player player;

  JoinInterface() {
    roomName = 'unknown';
    player = Player();
  }
}

class Room {
  late int elapsedTime;
  late String currentPlayerPseudo;
  late List<Player> players;
  late RoomInfo roomInfo;
  late bool isBankUsable;
  late bool isGameStarted;
  late int nbHumanPlayers;
  late int nbBots;

  Room() {
    roomInfo = RoomInfo();
    roomInfo.levelGame = 'easy';
    roomInfo.isPublic = true;
    players = [];
    isBankUsable = true;
    currentPlayerPseudo = "incognito";
    elapsedTime = 0;
    roomInfo.gameType = 'classic';
    isGameStarted = false;
    nbHumanPlayers = 1;
    nbBots = 0;
  }

  Map toJson() {
    Map room = {
      'elapsedTime': elapsedTime ?? 0,
      'currentPlayerPseudo': currentPlayerPseudo ?? 'incognito',
      'isBankUsable': isBankUsable ?? true,
      'isGameStarted': isGameStarted ?? false,
      'nbHumanPlayers': nbHumanPlayers ?? 1,
      'nbBots': nbBots ?? 4,
      'roomInfo': {
        'name': roomInfo.name ?? '',
        'timerPerTurn': roomInfo.timerPerTurn ?? '60',
        'dictionary': roomInfo.dictionary ?? 'dictionnaire par défaut',
        'gameType': roomInfo.gameType ?? 'classic',
        'isGameOver': roomInfo.isGameOver ?? true,
        'nbHumans': roomInfo.nbHumans ?? 2,
        'isPublic': roomInfo.isPublic ?? false,
        'pw': roomInfo.pw ?? '',
      },
      'players': []
    };

    for (var player in players) {
      room['players'].add(player.toJson());
    }

    return room;
  }
}
