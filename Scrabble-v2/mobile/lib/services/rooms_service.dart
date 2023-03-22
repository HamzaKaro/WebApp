import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:poly_scrabble/models/invitation.dart';
import 'package:poly_scrabble/models/player.dart';
import 'package:poly_scrabble/services/socket_service.dart';

import '../models/room.dart';
import '../screens/game/game_view_observer_screen.dart';
import '../screens/game/game_view_player_screen.dart';

class RoomService extends ChangeNotifier {
  bool isRejected = false;
  bool isInRoom = false;
  bool isPending = false;
  bool readyToStart = false;
  bool isPasswordCorrect = false;
  Player currentPlayer = Player();
  List<Room> rooms = [];
  List<Player> pendingPlayers = [];
  List<Player> toRemovePendingPlayers = [];
  List<List<String>> racks = [
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ']
  ];
  Room currentRoom = Room();
  final SocketService _socketService;

  /* **************** ROOM INFO HANDLING FOR WAITING ROOM**************** */

  createRoomInfo(Room room) {
    currentRoom = new Room();
    currentRoom.currentPlayerPseudo = room.currentPlayerPseudo;
    currentRoom.roomInfo.dictionary =
        room.roomInfo.dictionary == "/dictionnaire-par-defaut.json"
            ? "dictionnaire par défaut"
            : '';
    currentRoom.roomInfo.isGameOver = room.roomInfo.isGameOver;
    currentRoom.roomInfo.isPublic = room.roomInfo.isPublic;
    currentRoom.roomInfo.levelGame = room.roomInfo.levelGame;
    currentRoom.roomInfo.maxPlayers = room.roomInfo.maxPlayers;
    currentRoom.roomInfo.nbHumans = room.roomInfo.nbHumans;
    currentRoom.roomInfo.pw = room.roomInfo.pw;
    currentRoom.roomInfo.timerPerTurn = room.roomInfo.timerPerTurn;
    currentRoom.roomInfo.gameType = room.roomInfo.gameType;
    rooms.add(room);
    verifyPlayersList(currentRoom);
    addCreatorGameToRoom(currentPlayer);
    notifyListeners();
  }

  addCreatorGameToRoom(Player player) {
    currentRoom.players.add(player);
    currentRoom.players[0].socketId = _socketService.socket.id ?? '';
    currentRoom.players[0].isCreator = true;
    currentRoom.players[0].pseudo = currentRoom.currentPlayerPseudo;
    currentRoom.roomInfo.name = "";
    notifyListeners();
  }

  sendRoomToServer(Room room) {
    _socketService.send('joinRoom', currentRoom.toJson());
    notifyListeners();
  }

  verifyPlayersList(Room room) {
    if (room.players.isNotEmpty) {
      for (var player in room.players) {
        if (player.pseudo == currentPlayer.pseudo) {
          toRemovePendingPlayers.add(player);
        }
      }
    }
    room.players
        .removeWhere((player) => toRemovePendingPlayers.contains(player));
    return;
  }

  startGame() {
    // this.dictionarySelectedStillExists(this.room.roomInfo.dictionary);
    // if (this.httpService.anErrorOccurred()) {
    //     this.handleHttpError();
    //     return;
    // }
    isPending = false;
    isRejected = false;
    currentRoom.currentPlayerPseudo = currentPlayer.pseudo;
    if (currentRoom.players.length == currentRoom.roomInfo.nbHumans) {
      _socketService.send('acceptPlayers', currentRoom.toJson());
      Get.to(() => const GameViewPlayerScreen());
      _socketService.send('startGame', null);
      
    }
  }

  sendAcceptPlayer(Player player) {
    if (readyToStart) return;
    currentRoom.players.add(player);
    pendingPlayers.remove(player);
    _socketService.send('acceptPlayer',
        {'roomName': currentRoom.roomInfo.name, 'player': player.toJson()});
    if (currentRoom.players.length == currentRoom.roomInfo.nbHumans) {
      readyToStart = true;
    }
    notifyListeners();
  }

  sendRejectPlayer(Player player) {
    if (readyToStart) return;
    _socketService.send('rejectPlayer',
        {'room': currentRoom.toJson(), 'rejectedPlayer': player.toJson()});
    pendingPlayers.remove(player);
    notifyListeners();
  }

  Invitation convertInvitation(dynamic _invitation) {
    Invitation invitation = Invitation();
    invitation.emailSender = _invitation['emailSender'] ?? '';
    invitation.usernameSender = _invitation['usernameSender'] ?? '';
    invitation.emailReceiver = _invitation['emailReceiver'] ?? '';
    invitation.usernameReceiver = _invitation['usernameReceiver'] ?? '';
    invitation.room = convertSocketRoom(_invitation['room']);
    return invitation;
  }

  RoomService(this._socketService) {
    setSocketListeners();
    _socketService.send('availableRooms', null);
  }

  /* **************** CHANNELS HANDLING **************** */
  void leaveRoom() {
    try {
      _socketService.send('leaveRoomOther',
          {'room': currentRoom.roomInfo.name, 'player': currentPlayer});
    } catch (e) {
      log('Error while attemting to leaveRoom ${e.toString()}');
    }
    currentRoom.roomInfo.name = '';
    isInRoom = false;
    isRejected = false;
    isPending = false;
    notifyListeners();
  }

  void resetCurrentRoom() {
    isInRoom = false;
    currentRoom = Room();
    notifyListeners();
  }

  void giveUp() {
    try {
      _socketService.send('giveUp', null);
      resetCurrentRoom();
    } catch (e) {
      log('Error while attempting to give up ${e.toString()}');
    }
  }

  void cancelRoom() {
    try {
      _socketService.send('rejectAllPlayers',
          {'room': currentRoom, 'pendingPlayers': pendingPlayers});
    } catch (e) {
      log(e.toString());
    }
    currentRoom.roomInfo.name = '';
    isPending = false;
    isInRoom = false;
    isRejected = false;
    readyToStart = false;
    pendingPlayers.clear();
    currentRoom.players.clear();
    currentRoom.players.add(currentPlayer);
    notifyListeners();
  }

  void rejectAllPlayers() {
    if (currentRoom.players.length == currentRoom.roomInfo.nbHumans) {
      try {
        _socketService.send('rejectAllPlayers',
            {'room': currentRoom, 'pendingPlayers': pendingPlayers});
      } catch (e) {
        print(e);
      }
      currentRoom.roomInfo.name = '';
      isPending = false;
      isInRoom = false;
      isRejected = false;
      readyToStart = false;
      pendingPlayers.clear();
      currentRoom.players.clear();
      currentRoom.players.add(currentPlayer);
      notifyListeners();
    }
  }

  void getAvailableChannels() {
    _socketService.send('get-channels-list', null);
  }

  void askToJoin(Room room, Player player) {
    isRejected = false;
    isPending = true;
    player.socketId = _socketService.socket.id ?? '';
    currentPlayer = player;
    _socketService.send('requestToJoin',
        {'roomName': room.roomInfo.name, 'player': player.toJson()});
    currentRoom = room;
    notifyListeners();
  }

  List<Player> convertSocketPlayers(dynamic room) {
    List<Player> players = [];
    Player player_;
    for (var player in room['players']) {
      player_ = Player();
      player_.pseudo = player['pseudo'] ?? '';
      player_.socketId = player['socketId'] ?? '';
      player_.points = player['points'] ?? 0;
      player_.isCreator = player['isCreator'] ?? false;
      player_.isObserver = player['isObserver'] ?? false;
      player_.isItsTurn = player['isItsTurn'] ?? false;
      player_.rack.letters = player['rack']['letters'] ?? '';
      players.add(player_);
    }
    return players;
  }

  RoomInfo convertSocketRoomInfo(dynamic room) {
    RoomInfo roomInfo_ = RoomInfo();
    roomInfo_.dictionary = room['roomInfo']['dictionary'];
    roomInfo_.name = room['roomInfo']['name'];
    roomInfo_.isPublic = room['roomInfo']['isPublic'];
    roomInfo_.timerPerTurn = room['roomInfo']['timerPerTurn'].toString();
    roomInfo_.pw = room['roomInfo']['pw'];
    roomInfo_.isGameOver = room['roomInfo']['isGameOver'] ?? false;
    roomInfo_.nbHumans = room['roomInfo']['nbHumans'];
    roomInfo_.gameType = room['roomInfo']['gameType'].toString();
    return roomInfo_;
  }

  Room convertSocketRoom(dynamic room) {
    Room room_ = Room();
    room_.roomInfo = convertSocketRoomInfo(room);
    room_.elapsedTime = room['elapsedTime'] ?? 0;
    room_.currentPlayerPseudo = '';
    room_.isBankUsable = room['isBankUsable'] ?? true;
    room_.isGameStarted = room['isGameStarted'] ?? false;
    room_.nbHumanPlayers = room['nbHumanPlayers'] ?? 1;
    room_.nbBots = room['nbBots'] ?? 2;
    room_.players = convertSocketPlayers(room);
    return room_;
  }

  Player convertSocketPlayer(dynamic player) {
    Player player_ = Player();
    player_.pseudo = player['pseudo'] ?? '';
    player_.socketId = player['socketId'] ?? '';
    player_.points = player['points'] ?? 0;
    player_.isCreator = player['isCreator'] ?? false;
    player_.isItsTurn = player['isItsTurn'] ?? false;
    player_.isObserver = player['isObserver'] ?? false;
    return player_;
  }

  JoinInterface convertSocketJoinInterface(dynamic joinInterface) {
    JoinInterface joinInterface_ = JoinInterface();
    joinInterface_.roomName = joinInterface['roomName'];
    joinInterface_.player = convertSocketPlayer(joinInterface['player']);
    return joinInterface_;
  }

  void setSocketListeners() {
    _socketService.on('joinRoomStatus',
        (serverRoomName) => {currentRoom.roomInfo.name = serverRoomName});

    _socketService.on('playerWantsToJoin', (player) {
      if (currentRoom.roomInfo.isPublic &&
          currentRoom.players.length < currentRoom.roomInfo.nbHumans) {
        currentRoom.players.add(convertSocketPlayer(player));
        _socketService.send('acceptPlayer',
            {'roomName': currentRoom.roomInfo.name, 'player': player});
        if (currentRoom.players.length == currentRoom.roomInfo.nbHumans) {
          readyToStart = true;
        }
      } else if (!currentRoom.roomInfo.isPublic) {
        pendingPlayers.add(convertSocketPlayer(player));
      } else {
        Player playToReject = convertSocketPlayer(player);
        _socketService.send('rejectPlayer', {
          'room': currentRoom.toJson(),
          'rejectedPlayer': playToReject.toJson()
        });
        pendingPlayers.remove(playToReject);
      }
      notifyListeners();
    });

    _socketService.on('updateAvailableRoom', (rooms) {
      Room room_;
      this.rooms.clear();
      for (var room in rooms) {
        room_ = convertSocketRoom(room);
        this.rooms.add(room_);
      }
      notifyListeners();
    });

    _socketService.on('inRoom', (_) {
      isInRoom = true;
      isPending = false;
      isRejected = false;
      notifyListeners();
    });

    _socketService.on('playerAccepted', (roomCreator) {
      Room room_ = convertSocketRoom(roomCreator);
      currentRoom = room_;
      currentRoom.currentPlayerPseudo = currentPlayer.pseudo;
      isPending = false;
      isRejected = false;
      Get.to(() => const GameViewPlayerScreen());
      _socketService.send('startGame', null);
      notifyListeners();
    });

    _socketService.on('playerRejected', (roomCreator) {
      Room room_ = convertSocketRoom(roomCreator);
      _socketService.send('leaveRoomOther',
          {'room': room_.roomInfo.name, 'player': currentPlayer});
      currentRoom.roomInfo.name = '';
      isPending = false;
      isInRoom = false;
      isRejected = true;
      notifyListeners();
    });

    _socketService.on('updateRoom', (roomCreator) {
      try {
        currentRoom = convertSocketRoom(roomCreator);
        notifyListeners();
      } catch (e) {
        log('Error while attempting to update room, ${e.toString()}');
      }
    });

    _socketService.on('playerLeft', (playerName) {
      try {
        currentRoom.players.forEach((player) {
          if (player.pseudo == playerName) {
            currentRoom.players.removeAt(currentRoom.players.indexOf(player));
            this.readyToStart = false;
          }
        });
        pendingPlayers.forEach((pendingPlayer) {
          if (pendingPlayer.pseudo == playerName) {
            pendingPlayers.removeAt(pendingPlayers.indexOf(pendingPlayer));
          }
        });
      } catch (e) {
        log('Error while attempting to remove a player, ${e.toString()}');
      }
    });

    _socketService.on('updatePlayerScore', (data) {
      try {
        currentRoom.players
            .firstWhere((p) => p.pseudo == data['pseudo'])
            .points = data['points'];
        notifyListeners();
      } catch (e) {
        log("error while updating scores, ${e.toString()}");
      }
    });

    _socketService.on('drawRacks', (data) {
      try {
        for (int i = 0; i < currentRoom.players.length; i++) {
          for (int letter = 0; letter < 7; letter++) {
            racks[i][letter] = data[i][letter];
          }
        }
        ;
        notifyListeners();
      } catch (e) {
        log("Error while updating racks, ${e.toString()}");
      }
    });

    _socketService.on('replaceBot', (Null) {
      Get.to(() => const GameViewPlayerScreen());
    });
  }

  void sendFetchBoard() {
    _socketService.send('fetchBoard', currentRoom.roomInfo.name);
  }

  void observeGame(Room room, Player player) {
    isRejected = false;
    isInRoom = true;
    currentPlayer.isCreator = false;
    currentPlayer.socketId = _socketService.socket.id ?? '';
    currentPlayer.isObserver = true;
    currentPlayer = player;
    currentRoom = room;
    _socketService.send('requestToObserve',
        {'roomName': room.roomInfo.name, 'player': currentPlayer.toJson()});
    //TODO: mettre observerscreen
    Get.to(() => const GameViewObserverScreen());
  }

  void replaceBot(Player player) {
    _socketService.send('replaceBot', {
      'roomName': currentRoom.roomInfo.name,
      'observer': currentPlayer.toJson(),
      'bot': player.toJson()
    });
  }
}
