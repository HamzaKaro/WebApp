
import 'package:poly_scrabble/constants/board_constants.dart';

import '../models/board.dart';

class FetchBoardService{
  static void initializePlacedTiles(List<List<Tile?>> placedTiles, data){
    //data : [string,string]
    for(int row = 0; row < data.length; row++){
      String word = data[row];
      for(int index=0; index<word.length; index++){
        if(word[index]!= ' ') {
          RegExp(r'^[a-z]$').hasMatch(word[index]) ?
          placedTiles[index+1][row+1] = Tile.placed(
              word[index], Coordinate(index+1, row+1), tilesValues[word[index]]!) :
          placedTiles[index+1][row+1] =
              Tile.placedJoker(word[index], Coordinate(index+1, row+1));
        }
      }

    }

}

}
