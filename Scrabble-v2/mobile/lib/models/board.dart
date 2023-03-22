import 'package:flutter/material.dart';
import 'package:poly_scrabble/constants/board_constants.dart';

import '../constants/constants.dart';

enum TileState {
  exchange,
  fix,
  placement,
  easel;
}

enum MultiplierType {
  wordMultiplier,
  letterMultiplier,
}

class Coordinate {
  int x;
  int y;

  Coordinate(this.x, this.y);

  void move(Coordinate newCoordinate) {
    x = newCoordinate.x;
    y = newCoordinate.y;
  }

  bool isEqual(Coordinate other) {
    if (x == other.x && y == other.y) {
      return true;
    }
    return false;
  }

  void next(String orientation){
    if(orientation =='h')
      {x++;}
    else if(orientation == 'v')
      {y++;}
  }

}

class SpecialSquares {
  Coordinate coordinate;
  MultiplierType multiplierType;
  int multiplierValue;
  bool isStar;

  SpecialSquares(this.coordinate, this.multiplierType, this.multiplierValue,
      this.isStar);
}

class Position {
  double x;
  double y;

  Position(this.x, this.y);

  Position.offset(Offset offset)
      : x = offset.dx,
        y = offset.dy;

  void move(Position newPosition) {
    x = newPosition.x;
    y = newPosition.y;
  }

  //Coordinate toCoordinate( ){}
}



class Square {
  Position position;
  String content;
  Color textColor;
  Color color;

  Square(Position position, this.color, this.textColor, this.content)
      : position = Position(position.x, position.y);

  Square.empty()
      : position = Position(0, 0),
        content = '',
        textColor = defaultTextColor,
        color = squareDefaultColorLight;
}

class Tile implements Comparable<Tile> {
  Position? position;
  String letter;
  int value;
  TileState state;
  Coordinate? coordinate;
  bool? isJoker;

  Tile(Position position, this.letter, this.value, this.state,
      Coordinate coordinate)
      : position = Position(position.x, position.y),
        coordinate = Coordinate(coordinate.x, coordinate.y),
        isJoker = false;

  Tile.isJoker(Position position, this.letter, this.value, this.state,
  Coordinate coordinate, this.isJoker)
      : position = Position(position.x, position.y),
        coordinate = Coordinate(coordinate.x, coordinate.y);

  Tile.placed(this.letter, this.coordinate, this.value)
      : state = TileState.fix,
        isJoker = false;

  Tile.placedJoker(this.letter, this.coordinate)
      : state = TileState.fix,
        isJoker = true,
        value = 0;


  Tile.notPlaced(this.letter, this.value)
      : state = TileState.easel,
        coordinate = Coordinate(0, 0),
        isJoker = false;


  /*Tile.empty(): letter = '',
  position = ,
  value =,
  state =,
  coordinate = ;*/

  @override
  int compareTo(Tile other) {
    if (coordinate!.x == other.coordinate!.x) {
      return coordinate!.y - other.coordinate!.y;
    }
    return coordinate!.x - other.coordinate!.x;
  }
}
