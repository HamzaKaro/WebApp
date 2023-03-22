import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/services/popup_service.dart';

import '../../models/player.dart';
import '../constants/board_constants.dart';
import '../helpers/helpers.dart';
import '../models/board.dart';
import '../services/placementString_service.dart';
import 'exchangeString_service.dart';
import 'fetchBoard_service.dart';
import 'socket_service.dart';

class GameService extends ChangeNotifier {
  final SocketService socketService;
  final UserModel userModel;
  String currentPlayer = '';
  int _remainingTime = 0;
  int remainingLetters = 0;

  final Map<int, Tile?> easel = {};
  /*{0: Tile.isJoker(
        Position(100, 150), '', 8, TileState.easel, Coordinate(0, 0), true),
    1: Tile.isJoker(
        Position(250, 250), '', 1, TileState.easel, Coordinate(0, 0), true),
    2: Tile(Position(250, 250), 'B', 1, TileState.easel, Coordinate(0, 0)),
    3: Tile(Position(250, 250), 'C', 1, TileState.easel, Coordinate(0, 0)),
    4: Tile(Position(250, 250), 'D', 1, TileState.easel, Coordinate(0, 0)),
    5: Tile(Position(250, 250), 'E', 1, TileState.easel, Coordinate(0, 0)),
    6: Tile(Position(250, 250), 'F', 1, TileState.easel, Coordinate(0, 0)),
  };*/

  final placedTiles = List<List<Tile?>>.generate(
      numberOfSquaresInBoard.toInt() + 1,
      (index) => List<Tile?>.generate(
          numberOfSquaresInBoard.toInt() + 1, (index) => null,
          growable: false),
      growable: false);

  bool isGameOver = false;

  Coordinate? placementCursor;

  String remainingTime() {
    return formatTime(_remainingTime);
  }

  GameService(this.socketService, this.userModel) {
    setSocketListeners();
  }

  void resetPlacedTiles() {
    for (var i = 0; i < placedTiles.length; i++) {
      for (var j = 0; j < placedTiles[i].length; j++) {
        placedTiles[i][j] = null;
      }
    }
  }

  void resetEasel() {
    easel.forEach((key, value) {
      easel[key] = null;
    });
  }

  void reset() {
    currentPlayer = '';
    _remainingTime = 0;
    remainingLetters = 0;
    resetEasel();
    resetPlacedTiles();
    notifyListeners();
  }

  bool isConnectedPlayerTurn() {
    return currentPlayer == userModel.username;
  }

  void setSocketListeners() {
    socketService.on('playerTurnChanged', (data) {
      try {
        placementCursor = null;
        currentPlayer = data;
        if (!isConnectedPlayerTurn()) {
          returnTilesToEasel();
        }
        notifyListeners();
      } catch (e) {
        log("Error while changing turn ${e.toString()}");
      }
    });
    socketService.on('timeUpdated', (data) {
      try {
        _remainingTime = data;
        notifyListeners();
      } catch (e) {
        log("Error while updating time, ${e.toString()}");
      }
    });
    socketService.on('lettersBankCountUpdated', (data) {
      try {
        remainingLetters = data;
        notifyListeners();
      } catch (e) {
        log("Error while updating letter count, ${e.toString()}");
      }
    });

    socketService.on('drawBoard', (data) {
      try {
        PlacementStringService.updatePlacedTiles(placedTiles, data);
        notifyListeners();
      } catch (e) {
        log("Error while updating draw board, $e");
      }
    });
    socketService.on('drawRack', (data) {
      try {
        ExchangeStringService().updateEasel(easel, data.trim());
        notifyListeners();
      } catch (e) {
        log("Error while updating draw rack, ${e.toString()}");
      }
    });
    socketService.on('drawBoardCursor', (data) {
      try {
        if(data['x']==-1){ placementCursor = null; }
        else{ placementCursor = Coordinate(data['x'], data['y']); }
        notifyListeners();
      } catch (e) {
        log("Error while updating draw placement cursor, ${e.toString()}");
      }
    });

    socketService.on('fetchBoard', (data) {
      try {
        FetchBoardService.initializePlacedTiles(placedTiles, data);
        notifyListeners();
      } catch (e) {
        log("Error while fetching board, ${e.toString()}");
      }
    });

    socketService.on('gameIsOver', (dynamic winnerArray) {
      try {
        log('receiving "gameIsOver" event');
        isGameOver = true;
        List<Player> players = [];
        Player tempPlayer;
        var endGameText = translate("end_game.winners");
        for (var winner in winnerArray) {
          tempPlayer = Player();
          tempPlayer.pseudo = winner['pseudo'] ?? '';
          tempPlayer.points = winner['points'] ?? 0;
          players.add(tempPlayer);
          endGameText += '${tempPlayer.pseudo} ';
        }
        PopupService.hey(endGameText);
        notifyListeners();
      } catch (e) {
        log("Error while changing gameIsOver, ${e.toString()}");
      }
    });
  }

  void sendPlacementCursor(String roomName, Coordinate? placementCursor) {
    this.placementCursor = placementCursor;
    if (placementCursor != null) {
      dynamic data = {
        'roomName': roomName,
        'x': placementCursor?.x,
        'y': placementCursor?.y
      };
      socketService.send('drawBoardCursor', data);
    }
    else{
      dynamic data = {
        'roomName': roomName,
        'x': -1,
        'y': -1
      };
      socketService.send('drawBoardCursor', data);
    }
  }

  void sendPlacement() {
    socketService.send('command',
        PlacementStringService().placementCommand(easel, placedTiles));
  }

  void sendExchange() {
    socketService.send(
        'command', ExchangeStringService().exchangeCommand(easel));
  }

  void sendPass() {
    socketService.send('command', '!passer');
  }

  void returnTilesToEasel() {
    for (int index in easel.keys) {
      if (easel[index] != null) {
        easel[index]?.position = null;
        easel[index]?.state = TileState.easel;
        if(easel[index]?.isJoker == true){
          easel[index]?.letter = '*';
        }
      }
    }
  }
}
