import 'package:flutter/material.dart';
import 'package:poly_scrabble/models/user.dart';
import '../constants/constants.dart';
import '../models/models.dart';
import 'package:provider/provider.dart';

import 'game_service.dart';

import '../services/canvasColor_service.dart';

class ObserverBoardView extends CustomPainter {
  static const numberOfSquares = numberOfSquaresInBoard + 1;
  static const lineThickness = defaultLineThickness;

  double squareSize = 25;
  double halfSquareSize = 0;
  double tileSize = 0;
  var padding = defaultLineThickness * 2;

  List<List<Tile?>> placedTiles = [];
  Coordinate? placementCursor;

  bool isBoardInitialized = false;
  List<List<Square>> board = [];
  double get squareDimension {
    return squareSize;
  }
  BuildContext context;
  ObserverBoardView(this.squareSize, this.context, this.placedTiles, this.placementCursor);

  @override
  void paint(Canvas canvas, Size size) {
    if (!isBoardInitialized) {
      halfSquareSize = (squareSize * 0.5).floorToDouble();
      tileSize = squareSize - 2 * lineThickness;

      buildBoardArray();
      setIndexSquares();
      setSpecialSquares();
      isBoardInitialized = true;
    }
    placedTiles =
        Provider.of<GameService>(context, listen: false).placedTiles;

    //draw all squares from board
    for (List<Square> row in board) {
      for (Square square in row) {
        paintSquare(square, canvas);
      }
    }
    //draw placedTiles
    for (List<Tile?> row in placedTiles) {
      for (int i = 0; i < numberOfSquaresInBoard; i++) {
        if (row[i] != null) {
          if (row[i]!.position == null) {
            row[i]!.position = getPositionInBoard(row[i]!.coordinate!);
          }
          paintTile(canvas, row[i]!);
        }
      }
    }
    //draw placementCursor
    paintPlacementCursor(canvas);
  }

  @override
  bool shouldRepaint(ObserverBoardView oldDelegate) => true;

  void paintSquare(Square square, Canvas canvas) {
    canvas.drawRect(
      Rect.fromCenter(
          center: Offset(square.position.x, square.position.y),
          width: squareSize - lineThickness,
          height: squareSize - lineThickness),
      Paint()..color = square.color,
    );

    var textPainter = TextPainter(
      text: TextSpan(
        text: square.content,
        style: TextStyle(
          color: square.textColor,
          fontSize: defaultFontSize,
        ),
      ),
      textDirection: TextDirection.ltr,
      textAlign: TextAlign.end,
    );
    textPainter.layout(
      minWidth: 0,
      maxWidth: squareSize,
    );
    var offset = Offset(square.position.x - textPainter.width * 0.5,
        square.position.y - textPainter.height * 0.5);
    textPainter.paint(canvas, offset);
  }

  void paintTile(Canvas canvas, Tile tile) {
    canvas.drawRect(
      Rect.fromCenter(
          center: Offset(tile.position!.x, tile.position!.y),
          width: tileSize,
          height: tileSize),
      Paint()
        ..color = (tile.isJoker! && tile.state == TileState.placement)
            ? CanvasColors().jokerPlacementColor(
                Provider.of<UserModel>(context, listen: false)
                    .preferences
                    .theme)
            : CanvasColors().tileColor(
                Provider.of<UserModel>(context, listen: false)
                    .preferences
                    .theme, tile, Provider.of<GameService>(context, listen: false).isConnectedPlayerTurn()),
    );

    var textSpan = TextSpan(
        text: tile.letter.toUpperCase(),
        style: TextStyle(
            color: CanvasColors().textColor(
                Provider.of<UserModel>(context, listen: false)
                    .preferences
                    .theme),
            fontSize: tileSize * letterProportionInTile));
    var textPainter =
        TextPainter(text: textSpan, textDirection: TextDirection.ltr);

    textPainter.layout(minWidth: 0, maxWidth: tileSize);
    var offset = Offset(
        tile.position!.x - textPainter.width * 0.5 - 2 * padding,
        tile.position!.y - textPainter.height * 0.5);
    textPainter.paint(canvas, offset);

    var textSpan2 = TextSpan(
        text: tile.value.toString(),
        style: TextStyle(
            color: CanvasColors().textColor(
                Provider.of<UserModel>(context, listen: false)
                    .preferences
                    .theme),
            fontSize: tileSize * scoreProportionInTile));
    var textPainter2 =
        TextPainter(text: textSpan2, textDirection: TextDirection.ltr);
    textPainter2.layout(minWidth: 0, maxWidth: tileSize);
    var offset2 = Offset(
        tile.position!.x + halfSquareSize - textPainter2.width - padding,
        tile.position!.y +
            halfSquareSize -
            textPainter2.height -
            0.5 * padding);
    textPainter2.paint(canvas, offset2);
  }

  void buildBoardArray() {
    board = List.generate(
        numberOfSquares.toInt(),
        (index) =>
            List.generate(numberOfSquares.toInt(), (i) => Square.empty()));

    for (int i = 0; i < numberOfSquares; i++) {
      for (int j = 0; j < numberOfSquares; j++) {
        board[i][j].position.x = squareSize * (i + 0.5);
        board[i][j].position.y = squareSize * (j + 0.5);
        board[i][j].color = CanvasColors().squareDefaultColor(
            Provider.of<UserModel>(context, listen: false).preferences.theme);
        board[i][j].textColor = CanvasColors().textColor(
            Provider.of<UserModel>(context, listen: false).preferences.theme);
      }
    }
  }

  void setIndexSquares() {
    board[0][0].color = CanvasColors().backgroundColor(
        Provider.of<UserModel>(context, listen: false).preferences.theme);
    setRowIndex();
    setColumnIndex();
  }

  void setRowIndex() {
    for (int i = 1; i < numberOfSquares; i++) {
      board[i][0].color = CanvasColors().backgroundColor(
          Provider.of<UserModel>(context, listen: false).preferences.theme);
      board[i][0].content = i.toString();
    }
  }

  void setColumnIndex() {
    for (int i = 1; i < numberOfSquares; i++) {
      board[0][i].color = CanvasColors().backgroundColor(
          Provider.of<UserModel>(context, listen: false).preferences.theme);
      board[0][i].content = String.fromCharCode(i + 64);
    }
  }

  void setSpecialSquares() {
    for (SpecialSquares specialSquare in specialSquares) {
      board[specialSquare.coordinate.x][specialSquare.coordinate.y].color =
          CanvasColors().specialSquareColor(
              Provider.of<UserModel>(context, listen: false).preferences.theme,
              specialSquare);
      if (specialSquare.multiplierType == MultiplierType.letterMultiplier) {
        board[specialSquare.coordinate.x][specialSquare.coordinate.y].content =
            'Lettre';
      } else {
        board[specialSquare.coordinate.x][specialSquare.coordinate.y].content =
            'Mot';
      }
      board[specialSquare.coordinate.x][specialSquare.coordinate.y].content +=
          '\n X${specialSquare.multiplierValue}';
      if (specialSquare.isStar) {
        board[specialSquare.coordinate.x][specialSquare.coordinate.y].content =
            '\u2605';
      }
    }
  }

  void paintPlacementCursor(Canvas canvas) {
    placementCursor = Provider.of<GameService>(context, listen: false).placementCursor;
    if(placementCursor == null){return;}
    Position cursorPosition = getPositionInBoard(placementCursor!);
    canvas.drawRect(
      Rect.fromCenter(center: Offset(cursorPosition.x, cursorPosition.y), width: tileSize, height: tileSize ),
      Paint()..color = CanvasColors().placementCursorColor(
          Provider.of<UserModel>(context, listen: false).preferences.theme)
        ..strokeWidth = lineThickness.toDouble()
        ..style = PaintingStyle.fill,
    );
    var textSize = tileSize * 0.2;
    var textSpan = TextSpan(
        text: placementCursorText,
        style:
        TextStyle(color: CanvasColors().textColor(Provider.of<UserModel>(context, listen: false).preferences.theme), fontSize: textSize));

    var textPainter =
    TextPainter(text: textSpan, textDirection: TextDirection.ltr, textAlign: TextAlign.center,);

    textPainter.layout(minWidth: 0, maxWidth: tileSize*10);
//TODO: trying to make fontSize dynamic with squareSize, but something wrong, see if possible to improve
    /*while(textPainter.width > tileSize * 2){
      textSize = (textSize - 5).floorToDouble();
      textSpan = TextSpan(
          text: placementCursorText,
          style:
          TextStyle(color: defaultTextColor, fontSize: textSize));
      textPainter =
          TextPainter(text: textSpan, textDirection: TextDirection.ltr, textAlign: TextAlign.center,);
    }*/

    textPainter.layout(minWidth: 0, maxWidth: tileSize);
    var offset = Offset(
        cursorPosition.x - textPainter.width * 0.5 ,
        cursorPosition.y - textPainter.height * 0.5);
    textPainter.paint(canvas, offset);

  }

  Position getPositionInBoard(Coordinate coordinate) {
    return board[coordinate.x][coordinate.y].position;
  }
}




