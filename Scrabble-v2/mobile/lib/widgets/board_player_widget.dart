import 'dart:async';

import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:poly_scrabble/services/game_service.dart';
import 'package:poly_scrabble/services/popup_service.dart';
import 'package:provider/provider.dart';
import 'package:shake/shake.dart';

import '../constants/board_constants.dart';
import '../models/board.dart';
import '../services/boardView_service.dart';
import '../services/rooms_service.dart';

class Board extends StatefulWidget {
  Board({Key? key}) : super(key: key);

  final BoardState board = BoardState();
  @override
  State<Board> createState() => board;
  void returnTilesToEasel() {
    board.returnTilesToEasel();
  }
}

class BoardState extends State<Board> {
  bool isDown = false;
  double x = 0;
  double y = 0;
  int? targetId;
  late double squareSize;
  final TextEditingController jokerController = TextEditingController();
  Map<int, Tile?> easel = {};
  late BoardView boardView;
  late List<List<Tile?>> placedTiles;
  Coordinate? placementCursor;
  Map<int, int> tilesInPlacementOrder = {};
  int counter = 1;
  int cursorIndex = numberTilesInEasel;
  late bool isGameOver;
  bool isEndGamePopupShown = true;
  late Timer timer;
  late ShakeDetector shakeDetector;

  bool isInEasel(Tile? tile, double dx, double dy) {
    if (tile == null) {
      return false;
    }
    Path tempPath = Path()
      ..addOval(Rect.fromCenter(
          center: Offset(tile.position!.x, tile.position!.y),
          width: squareSize,
          height: squareSize));
    return tempPath.contains(Offset(dx, dy));
  }

  void down(DragStartDetails details) {
    setState(() {
      x = details.localPosition.dx;
      y = details.localPosition.dy;
      targetId =
          easel.keys.firstWhereOrNull((id) => isInEasel(easel[id]!, x, y));
      print('down');
      print(targetId);
      if (targetId != null) {
        isDown = true;
      }
    });
  }

  Future<void> up(DragEndDetails details) async {
    if (targetId != null) {
      setTilePosition(details);
      if ((easel[targetId]?.isJoker == true) &&
          (easel[targetId]?.letter == '*') &&
          (easel[targetId]?.state == TileState.placement)) {
        // openJokerPopup(context, targetId);
        var joker = await PopupService.openJokerPopup(context);
        if (joker == null) {
          returnTileToEasel(targetId!);
        } else {
          setState(() {
            easel[targetId]!.letter = joker;
          });
        }
      }
      updateTilesPlacementOrder();
    }
    setState(() {
      isDown = false;
      targetId = null;
      print(targetId);
    });
  }

  void updateTilesPlacementOrder() {
    if (easel[targetId]?.state == TileState.placement) {
      tilesInPlacementOrder[targetId!] = counter;
      counter++;
    }
    if (easel[targetId]?.state == TileState.easel) {
      tilesInPlacementOrder[targetId!] = 0;
    }
    if (targetId == cursorIndex ||
        cursorIndex == numberTilesInEasel ||
        placementCursor == null) {
      var tiInPl = Map.fromEntries(tilesInPlacementOrder.entries.toList()
        ..sort((e1, e2) => e1.value.compareTo(e2.value)));

      cursorIndex = tiInPl.keys.firstWhere(
          (key) => tiInPl[key] != 0 && easel[key]?.state == TileState.placement,
          orElse: () => numberTilesInEasel);
      var roomName = Provider.of<RoomService>(context, listen: false)
          .currentRoom
          .roomInfo
          .name;
      if (cursorIndex == numberTilesInEasel) {
        placementCursor = null;
        Coordinate eraseCursor = Coordinate(-1, -1);
        Provider.of<GameService>(context, listen: false)
            .sendPlacementCursor(roomName, eraseCursor);
      } else {
        placementCursor = Coordinate(easel[cursorIndex]!.coordinate!.x,
            easel[cursorIndex]!.coordinate!.y);
        Provider.of<GameService>(context, listen: false)
            .sendPlacementCursor(roomName, placementCursor);
      }
    }
  }

  void move(DragUpdateDetails details) {
    setState(() {
      if (isDown) {
        x += details.delta.dx;
        y += details.delta.dy;
        if (targetId != null) {
          if (!isInGameArea()) {
            returnTileToEasel(targetId!);
            targetId = null;
          } else {
            easel[targetId]!.position!.x = x;
            easel[targetId]!.position!.y = y;
            easel[targetId]!.state = TileState.placement;
          }
        }
      }
    });
  }

  void tap(TapUpDetails details) {
    setState(() async {
      x = details.localPosition.dx;
      y = details.localPosition.dy;
      targetId =
          easel.keys.firstWhereOrNull((id) => isInEasel(easel[id]!, x, y));
      if (targetId != null) {
        if (easel[targetId]!.state == TileState.easel) {
          easel[targetId]!.state = TileState.exchange;
        } else if (easel[targetId]!.state == TileState.exchange) {
          easel[targetId]!.state = TileState.easel;
        } else if (easel[targetId]!.state == TileState.placement &&
            easel[targetId]!.isJoker == true) {
          var joker = await PopupService.openJokerPopup(context);
          if (joker == null) {
            returnTileToEasel(targetId!);
          } else {
            setState(() {
              easel[targetId]!.letter = joker;
            });
          }
        }
      }
      targetId = null;
    });
  }

  void verifyIsAnyTileInBoard() {
    if (!easel
        .containsValue((Tile tile) => tile.state == TileState.placement)) {
      placementCursor = null;
      var roomName = Provider.of<RoomService>(context, listen: false)
          .currentRoom
          .roomInfo
          .name;
      Provider.of<GameService>(context, listen: false)
          .sendPlacementCursor(roomName, placementCursor);
    }
  }

  void setTilePosition(DragEndDetails details) {
    if (!isInBoard()) {
      returnTileToEasel(targetId!);
      updateTilesPlacementOrder();
    } else {
        Coordinate coordinate = computeCoordinate(x, y);
        if (targetId != null) {
          if (isSquareAvailable(coordinate)) {
            easel[targetId]!.position!.move(boardView.getPositionInBoard(coordinate));
            easel[targetId]!.coordinate = coordinate;
            easel.forEach((key, value) => {
              if ((value != null )&&(value!.coordinate != null)&& (value.coordinate!.isEqual(coordinate) && key != targetId)){
                returnTileToEasel(key)
              }
            });
          }
      } else {
      returnTileToEasel(targetId!);}
    }
  }

  bool isSquareAvailable(Coordinate coordinate) {
    if (placedTiles[coordinate.x][coordinate.y] != null) {
      return false;
    }
    return true;
  }

  bool isInBoard() {
    if ((x < squareSize) ||
        (y < squareSize) ||
        (y > squareSize * (numberOfSquaresInBoard + 1)) ||
        (x > squareSize * (numberOfSquaresInBoard + 1))) {
      return false;
    }
    return true;
  }

  bool isInGameArea() {
    if ((x < 0) ||
        (y < 0) ||
        (y > squareSize * (numberOfSquaresInBoard + 1)) ||
        (x > squareSize * (numberOfSquaresInBoard + 4))) {
      return false;
    }
    return true;
  }

  void returnTileToEasel(int key) {
    if (easel[key]!.isJoker == true) {
      easel[key]!.letter = '*';
    }
    easel[key]!
        .position!
        .move(Position.offset(boardView.getTilePositionInEasel(key)));

    easel[key]!.state = TileState.easel;
    easel[key]!.coordinate = null;
  }

  void returnTileToEaselAnimated(int key) {
    var value = easel[key]!.position!.x;
    timer = Timer.periodic(Duration(milliseconds: 100 ~/ 60), (timer) {
      if (value <= Position.offset(boardView.getTilePositionInEasel(key)).x) {
        setState(() {
          easel[key]!.position!.move(Position(value, easel[key]!.position!.y));
          value += 1.0;
        });
      } else {
        returnTileToEasel(key);
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    // TODO: implement dispose
    timer.cancel();
    shakeDetector.stopListening();
    super.dispose();
  }

  void returnTilesToEasel() {
    for (int index in easel.keys) {
      returnTileToEasel(index);
    }
  }

  void restTilesInPlacementOrder() {
    for (int i = 0; i < numberTilesInEasel; i++) {
      tilesInPlacementOrder[i] = 0;
    }
    cursorIndex = numberTilesInEasel;
    counter = 1;
  }

  Coordinate computeCoordinate(double x, double y) {
    return Coordinate((x / squareSize).floor(), (y / squareSize).floor());
  }

  void returnTilesToEaselAnimated() {
    for (int index in easel.keys) {
      returnTileToEaselAnimated(index);
    }
  }

  void listenShake() {
    shakeDetector = ShakeDetector.autoStart(
      onPhoneShake: () {
        returnTilesToEaselAnimated();
        // Do stuff on phone shake
      },
      minimumShakeCount: 1,
      shakeSlopTimeMS: 500,
      shakeCountResetTime: 3000,
      shakeThresholdGravity: 2.7,
    );
  }
    @override
    void initState() {
      for (int i = 0; i < numberTilesInEasel; i++) {
        tilesInPlacementOrder[i] = 0;
      }
      listenShake();
      super.initState();
    }

    @override
    Widget build(BuildContext context) {
      easel = Provider.of<GameService>(context, listen: true).easel;
      placedTiles = Provider.of<GameService>(context, listen: true).placedTiles;
      isGameOver = Provider.of<GameService>(context, listen: true).isGameOver;

      squareSize =
          (MediaQuery.of(context).size.height - defaultBottomBarHeight) /
              (numberOfSquaresInBoard + 1).floorToDouble();
      boardView = BoardView(squareSize, context);
      placementCursor =
          Provider.of<GameService>(context, listen: true).placementCursor;
      if (placementCursor == null) {
        restTilesInPlacementOrder();
      }
      PopupService.theContext = context;
      return Center(
        child: GestureDetector(
            onPanStart: (details) {
              if (Provider.of<GameService>(context, listen: false)
                  .isConnectedPlayerTurn()) {
                down(details);
              }
            },
            onPanEnd: (details) {
              if (Provider.of<GameService>(context, listen: false)
                  .isConnectedPlayerTurn()) {
                up(details);
              }
            },
            onPanUpdate: (details) {
              if (Provider.of<GameService>(context, listen: false)
                  .isConnectedPlayerTurn()) {
                move(details);
              }
            },
            onTapUp: (details) {
              if (Provider.of<GameService>(context, listen: false)
                  .isConnectedPlayerTurn()) {
                tap(details);
              }
            },
            child: Container(
              width: (4 + numberOfSquaresInBoard) * squareSize,
              height: MediaQuery.of(context).size.height,
              color: Theme.of(context).canvasColor,
              child: CustomPaint(
                  foregroundPainter:
                      boardView //painter si on veut mettre autre chose en background
                  ),
            )),
      );
    }
  }

