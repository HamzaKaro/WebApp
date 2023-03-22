import 'package:poly_scrabble/constants/board_constants.dart';

import '../models/board.dart';

class ExchangeStringService {
  String exchangeCommand(Map<int, Tile?> easel) {
    List<Tile> tilesToExchange = extractTilesToExchange(easel);
    String exchangeInstruction = '!échanger ';

    for (Tile tile in tilesToExchange) {
      exchangeInstruction += (tile.isJoker!) ? '*' : tile.letter.toLowerCase();
    }

    return exchangeInstruction;
  }

  List<Tile> extractTilesToExchange(Map<int, Tile?> easel) {
    List<Tile> tilesToExchange = [];
    easel.forEach((key, value) {
      if (value?.state == TileState.exchange) {
        tilesToExchange.add(value!);
      }
    });
    return tilesToExchange;
  }

  void updateEasel(Map<int, Tile?> easel, String data) {
    for (int i = 0; i < data.length; i++) {
      if (data[i] == '*') {
        easel[i] = Tile.notPlaced('*', tilesValues[data[i]]!);
        easel[i]?.isJoker = true;
      } else {
        easel[i] = Tile.notPlaced(data[i], tilesValues[data[i]]!);
      }
    }
    if (data.length < numberTilesInEasel) {
      for (int i = data.length; i < numberTilesInEasel; i++) {
        easel[i] = null;
      }
    }
  }
}
