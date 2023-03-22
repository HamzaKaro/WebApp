import 'package:flutter/material.dart';
import '../models/board.dart';

const double defaultBottomBarHeight = 40;

const double numberOfSquaresInBoard = 15;
const double defaultFontSize = 12;
const defaultLineThickness = 2;
const numberTilesInEasel = 7;
const letterProportionInTile = 0.6;
const scoreProportionInTile = 0.4;
const String placementCursorText = 'placement ici';

const textColorLight = Color(0xFF000000);
const textColorDark = Color(0xFFFFFFFF);

const defaultBorderColor = Color(0xFFFFFFFF);
const backGroundColorLight = Color(0xFFFFFFFF);
const backGroundColorDark = Color(0xFF000000);

const easelBorderColorLight = Color(0xFF000000);
const easelBorderColorDark = Color(0xFFFFFFFF);

const defaultTextColor = Color(0xFF000000);
const tileColorLight = Color(0xFFECBA8C);
const tileColorDark = Color(0xFFECBA8C);
const tileColorNotPlayingLight = Color(0xFFBBBECA);
const tileColorNotPlayingDark = Color(0xFFBBBECA);

const jokerPlacementColorLight = Color(0xFFFB861A);
const jokerPlacementColorDark = Color(0xFFFB861A);

const squareBonusLetter2ColorLight = Color(0xFFBBBECA);
const squareBonusLetter3ColorLight = Color(0xFFA8BBFF);
const squareBonusWord2ColorLight = Color(0xFFFFC7C7);
const squareBonusWord3ColorLight = Color(0xFFE8A1A1);

const squareBonusLetter2ColorDark = Color(0xFFBBBECA);
const squareBonusLetter3ColorDark = Color(0xFFA8BBFF);
const squareBonusWord2ColorDark = Color(0xFFFFC7C7);
const squareBonusWord3ColorDark = Color(0xFFE8A1A1);

const squareDefaultColorLight = Color(0xFFFFEBCE);
const squareDefaultColorDark = Color(0xFFFFEBCE);

const defaultRackTileColor = Color(0xFFECBA8C);
const defaultBorderExchangeColor = Color(0xFF008000);
const defaultBorderPlacementColor = Color(0xFFFF0000);

const placementCursorColorLight = Color(0xFF6e8b3d);
const placementCursorColorDark = Color(0xFF6e8b3d);

const Map<String, int> tilesValues = {
  'a': 1,
  'b': 3,
  'c': 3,
  'd': 2,
  'e': 1,
  'f': 4,
  'g': 2,
  'h': 4,
  'i': 1,
  'j': 8,
  'k': 10,
  'l': 1,
  'm': 2,
  'n': 1,
  'o': 1,
  'p': 3,
  'q': 8,
  'r': 1,
  's': 1,
  't': 1,
  'u': 1,
  'v': 4,
  'w': 10,
  'x': 10,
  'y': 10,
  'z': 10,
  '*': 0,
};

final List<SpecialSquares> specialSquares = [
  SpecialSquares(Coordinate(4, 1), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(12, 1), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(7, 3), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(9, 3), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(1, 4), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(8, 4), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(15, 4), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(3, 7), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(7, 7), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(9, 7), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(13, 7), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(4, 8), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(12, 8), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(3, 9), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(7, 9), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(9, 9), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(13, 9), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(1, 12), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(8, 12), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(15, 12), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(7, 13), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(9, 13), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(4, 15), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(12, 15), MultiplierType.letterMultiplier, 2, false),
  SpecialSquares(Coordinate(1, 1), MultiplierType.wordMultiplier, 3, false),
  SpecialSquares(Coordinate(8, 1), MultiplierType.wordMultiplier, 3, false),
  SpecialSquares(Coordinate(15, 1), MultiplierType.wordMultiplier, 3, false),
  SpecialSquares(Coordinate(1, 8), MultiplierType.wordMultiplier, 3, false),
  SpecialSquares(Coordinate(15, 8), MultiplierType.wordMultiplier, 3, false),
  SpecialSquares(Coordinate(1, 15), MultiplierType.wordMultiplier, 3, false),
  SpecialSquares(Coordinate(8, 15), MultiplierType.wordMultiplier, 3, false),
  SpecialSquares(Coordinate(15, 15), MultiplierType.wordMultiplier, 3, false),
  SpecialSquares(Coordinate(2, 2), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(3, 3), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(4, 4), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(5, 5), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(11, 5), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(12, 4), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(13, 3), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(14, 2), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(5, 11), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(4, 12), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(3, 13), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(2, 14), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(11, 11), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(12, 12), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(13, 13), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(14, 14), MultiplierType.wordMultiplier, 2, false),
  SpecialSquares(Coordinate(8, 8), MultiplierType.wordMultiplier, 2, true),
  SpecialSquares(Coordinate(6, 2), MultiplierType.letterMultiplier, 3, false),
  SpecialSquares(Coordinate(10, 2), MultiplierType.letterMultiplier, 3, false),
  SpecialSquares(Coordinate(6, 6), MultiplierType.letterMultiplier, 3, false),
  SpecialSquares(Coordinate(10, 6), MultiplierType.letterMultiplier, 3, false),
  SpecialSquares(Coordinate(14, 6), MultiplierType.letterMultiplier, 3, false),
  SpecialSquares(Coordinate(2, 10), MultiplierType.letterMultiplier, 3, false),
  SpecialSquares(Coordinate(6, 10), MultiplierType.letterMultiplier, 3, false),
  SpecialSquares(Coordinate(10, 10), MultiplierType.letterMultiplier, 3, false),
  SpecialSquares(Coordinate(14, 10), MultiplierType.letterMultiplier, 3, false),
  SpecialSquares(Coordinate(6, 14), MultiplierType.letterMultiplier, 3, false),
  SpecialSquares(Coordinate(10, 14), MultiplierType.letterMultiplier, 3, false),
  SpecialSquares(Coordinate(2, 6), MultiplierType.letterMultiplier, 3, false),
];

const frenchDiacritics = 'ÀàÂâÇçÉéÈèÊêËëÎîÏïÔôÙùÛûÜüŸÿ';
const frenchDiacriticsWithoutAccents = 'AaAaCcEeEeEeEeIiIiOoUuUuUuYy';
