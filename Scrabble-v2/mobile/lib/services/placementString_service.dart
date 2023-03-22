import 'package:poly_scrabble/constants/board_constants.dart';

import '../models/board.dart';

class PlacementStringService {
  String placementCommand(Map<int, Tile?> easel, List<List<Tile?>> placedTiles) {
    const String noTilesPlaced = '!placer h4h';

    String orientation = '';
    String placementInstruction = '';

    List<Tile> tilesToPlace = extractTilesToPlace(easel);
    if (tilesToPlace
        .isEmpty) {
      return noTilesPlaced;
    }
    if (isPlacementHorizontal(tilesToPlace)) {
      orientation = 'h';
    } else if (isPlacementVertical(tilesToPlace)) {
      orientation = 'v';
    } else {
      placementInstruction = '!placer ';
      placementInstruction += calculateAlphanumericCoordinate(tilesToPlace[0]);
      placementInstruction += orientation;
      for (Tile tile in tilesToPlace) {
        placementInstruction += (tile.isJoker!)
            ? tile.letter.toUpperCase()
            : tile.letter.toLowerCase();
        placementInstruction += ' ';
      }
      return placementInstruction;
    }

    tilesToPlace.sort();

    if (isPlacementInOneBlock(tilesToPlace, orientation, placedTiles)) {
      placementInstruction = '!placer ';
      placementInstruction += calculateAlphanumericCoordinate(tilesToPlace[0]);
      placementInstruction += orientation;
      placementInstruction += ' ';
      for (Tile tile in tilesToPlace) {
        placementInstruction += (tile.isJoker!)
            ? tile.letter.toUpperCase()
            : tile.letter.toLowerCase();
      }
    }
    return (placementInstruction);
  }

  List<Tile> extractTilesToPlace(Map<int, Tile?> easel) {
    List<Tile> tilesToPlace = [];
    easel.forEach((key, value) {
      if (value?.state == TileState.placement) {
        tilesToPlace.add(value!);
      }
    });
    return tilesToPlace;
  }

  bool isPlacementHorizontal(List<Tile> tilesToPlace) {
    if (tilesToPlace.length == 1) {
      return true;
    }
    int y = tilesToPlace[0].coordinate!.y;
    for (Tile tile in tilesToPlace) {
      if (tile.coordinate!.y != y) {
        return false;
      }
    }
    return true;
  }

  bool isPlacementVertical(List<Tile> tilesToPlace) {
    int x = tilesToPlace[0].coordinate!.x;
    for (Tile tile in tilesToPlace) {
      if (tile.coordinate!.x != x) {
        return false;
      }
    }
    return true;
  }

  bool isPlacementInOneBlock(List<Tile> tilesToPlace, String orientation,
      List<List<Tile?>> placedTiles) {
    int i = 0;
    Coordinate coordinate =
        Coordinate(tilesToPlace[0].coordinate!.x, tilesToPlace[0].coordinate!.y);

    while (i < tilesToPlace.length) {
      if (tilesToPlace[i].coordinate!.isEqual(coordinate)) {
        coordinate.next(orientation);
        i++;
      } else if (placedTiles[coordinate.x][coordinate.y] == null) {
        return false;
      } else {
        coordinate.next(orientation);
      }
    }
    return true;
  }

  String calculateAlphanumericCoordinate(Tile tile) {
    return String.fromCharCode(tile.coordinate!.y + 96) +
        tile.coordinate!.x.toString();
  }

  static void updatePlacedTiles(List<List<Tile?>> placedTiles, data) {
    String word = data['word'];
    String orientation = data['direction'];
    String row = data['row'];
    int column = data['column'];

    Coordinate coordinate = convertRowColumnToCoordinate(row, column);

    int i = 0;
    while (i < word.length) {
      if ((placedTiles[coordinate.x][coordinate.y]) == null) {
        if( RegExp(r'^[a-z]$').hasMatch(word[i])){
        placedTiles[coordinate.x][coordinate.y] = Tile.placed(word[i],
            Coordinate(coordinate.x, coordinate.y), tilesValues[word[i]]!);
        i++;}
        else{ placedTiles[coordinate.x][coordinate.y] = Tile.placedJoker(word[i], Coordinate(coordinate.x, coordinate.y));
        i++;}
      }
      coordinate.next(orientation);
    }
  }

  static Coordinate convertRowColumnToCoordinate(String row, int column) {
    return Coordinate(column, row.codeUnitAt(0) - 96);
  }
}
