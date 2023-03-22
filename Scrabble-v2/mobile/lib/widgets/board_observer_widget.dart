import 'package:flutter/material.dart';
import 'package:poly_scrabble/services/game_service.dart';
import 'package:provider/provider.dart';
import '../models/board.dart';
import '../services/boardView_service.dart';
import '../services/observerBoardView_service.dart';
import '../services/rooms_service.dart';
import '../constants/board_constants.dart';
import 'package:collection/collection.dart';

class BoardObserver extends StatefulWidget {
  BoardObserver({Key? key}) : super(key: key);

  final BoardObserverState board = BoardObserverState();
  @override
  State<BoardObserver> createState() => board;

}

class BoardObserverState extends State<BoardObserver> {
  late double squareSize;
  late List<List<Tile?>> placedTiles;
  Coordinate? placementCursor;
  late ObserverBoardView observerBoardView;

  @override
  Widget build(BuildContext context) {
    squareSize = (MediaQuery.of(context).size.height - defaultBottomBarHeight) /
        (numberOfSquaresInBoard + 1).floorToDouble();
    placedTiles = Provider.of<GameService>(context, listen: true).placedTiles;
    placementCursor = Provider.of<GameService>(context, listen: true).placementCursor;

    observerBoardView = ObserverBoardView(squareSize, context,
        placedTiles,
        placementCursor);

    return Center(
          child: Container(
            //todo: change number to remove white space on right of screen
            width: (2 + numberOfSquaresInBoard) * squareSize,
            height: MediaQuery.of(context).size.height,
            color: Theme.of(context).canvasColor,
            child: CustomPaint(
                foregroundPainter:
                    observerBoardView//painter si on veut mettre autre chose en background
                ),
          ),
    );
  }
}
