import 'package:flutter/material.dart';
import 'package:poly_scrabble/enums/board-colors/bubble-tea-theme.dart';
import 'package:poly_scrabble/enums/board-colors/dark-theme.dart';
import 'package:poly_scrabble/enums/board-colors/fall-guys-theme.dart';
import 'package:poly_scrabble/enums/board-colors/halloween-theme.dart';
import 'package:poly_scrabble/enums/board-colors/light-theme.dart';
import 'package:poly_scrabble/enums/board-colors/minecraft-theme.dart';
import 'package:poly_scrabble/enums/board-colors/uni-theme.dart';
import 'package:poly_scrabble/models/board.dart';

class CanvasColors {
  Color textColor(String theme) {
    switch (theme) {
      case 'light':
        {
          return LightTheme.Text;
        }
      case 'dark':
        {
          return DarkTheme.Text;
        }
      case 'uni':
        {
          return UniTheme.Text;
        }
      case 'fallGuys':
        {
          return FallGuysTheme.Text;
        }
      case 'minecraft':
        {
          return MinecraftTheme.Text;
        }
      case 'bubbleTea':
        {
          return BubbleTeaTheme.Text;
        }
      case 'halloween':
        {
          return HalloweenTheme.Text;
        }
      default:
        {
          // same has light
          return LightTheme.Text;
        }
    }
  }

  // Color backgroundColor(String theme) {
  //   return (theme == 'dark') ? backGroundColorDark : backGroundColorLight;
  // }

  Color backgroundColor(String theme) {
    switch (theme) {
      case 'light':
        {
          return LightTheme.BoardBackground;
        }
      case 'dark':
        {
          return DarkTheme.BoardBackground;
        }
      case 'uni':
        {
          return UniTheme.BoardBackground;
        }
      case 'fallGuys':
        {
          return FallGuysTheme.BoardBackground;
        }
      case 'minecraft':
        {
          return MinecraftTheme.BoardBackground;
        }
      case 'bubbleTea':
        {
          return BubbleTeaTheme.BoardBackground;
        }
      case 'halloween':
        {
          return HalloweenTheme.BoardBackground;
        }
      default:
        {
          // same has light
          return LightTheme.BoardBackground;
        }
    }
  }

  Color arrowColor(String theme) {
    switch (theme) {
      case 'light':
        {
          return LightTheme.ArrowCursorBackground;
        }
      case 'dark':
        {
          return DarkTheme.ArrowCursorBackground;
        }
      case 'uni':
        {
          return UniTheme.ArrowCursorBackground;
        }
      case 'fallGuys':
        {
          return FallGuysTheme.ArrowCursorBackground;
        }
      case 'minecraft':
        {
          return MinecraftTheme.ArrowCursorBackground;
        }
      case 'bubbleTea':
        {
          return BubbleTeaTheme.ArrowCursorBackground;
        }
      case 'halloween':
        {
          return HalloweenTheme.ArrowCursorBackground;
        }
      default:
        {
          // same has light
          return LightTheme.ArrowCursorBackground;
        }
    }
  }

  Color specialSquareColor(String theme, SpecialSquares specialSquare) {
    switch (theme) {
      case 'light':
        {
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 2) {
            return LightTheme.DoubleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 3) {
            return LightTheme.TripleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 2) {
            return LightTheme.DoubleWordSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 3) {
            return LightTheme.TripleWordSquare;
          }
        }
        break;
      case 'dark':
        {
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 2) {
            return DarkTheme.DoubleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 3) {
            return DarkTheme.TripleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 2) {
            return DarkTheme.DoubleWordSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 3) {
            return DarkTheme.TripleWordSquare;
          }
        }
        break;
      case 'uni':
        {
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 2) {
            return UniTheme.DoubleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 3) {
            return UniTheme.TripleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 2) {
            return UniTheme.DoubleWordSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 3) {
            return UniTheme.TripleWordSquare;
          }
        }
        break;
      case 'fallGuys':
        {
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 2) {
            return FallGuysTheme.DoubleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 3) {
            return FallGuysTheme.TripleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 2) {
            return FallGuysTheme.DoubleWordSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 3) {
            return FallGuysTheme.TripleWordSquare;
          }
        }
        break;
      case 'minecraft':
        {
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 2) {
            return MinecraftTheme.DoubleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 3) {
            return MinecraftTheme.TripleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 2) {
            return MinecraftTheme.DoubleWordSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 3) {
            return MinecraftTheme.TripleWordSquare;
          }
        }
        break;
      case 'bubbleTea':
        {
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 2) {
            return BubbleTeaTheme.DoubleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 3) {
            return BubbleTeaTheme.TripleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 2) {
            return BubbleTeaTheme.DoubleWordSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 3) {
            return BubbleTeaTheme.TripleWordSquare;
          }
        }
        break;
      case 'halloween':
        {
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 2) {
            return HalloweenTheme.DoubleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 3) {
            return HalloweenTheme.TripleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 2) {
            return HalloweenTheme.DoubleWordSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 3) {
            return HalloweenTheme.TripleWordSquare;
          }
        }
        break;
      default:
        {
          // same has light
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 2) {
            return LightTheme.DoubleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.letterMultiplier &&
              specialSquare.multiplierValue == 3) {
            return LightTheme.TripleLetterSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 2) {
            return LightTheme.DoubleWordSquare;
          }
          if (specialSquare.multiplierType == MultiplierType.wordMultiplier &&
              specialSquare.multiplierValue == 3) {
            return LightTheme.TripleWordSquare;
          }
        }
    }
    return squareDefaultColor(theme);
  }
  // Equals to getNormalSquareColor on desktop
  Color squareDefaultColor(String theme) {
    switch (theme) {
      case 'light':
        {
          return LightTheme.NormalSquare;
        }
      case 'dark':
        {
          return DarkTheme.NormalSquare;
        }
      case 'uni':
        {
          return UniTheme.NormalSquare;
        }
      case 'fallGuys':
        {
          return FallGuysTheme.NormalSquare;
        }
      case 'minecraft':
        {
          return MinecraftTheme.NormalSquare;
        }
      case 'bubbleTea':
        {
          return BubbleTeaTheme.NormalSquare;
        }
      case 'halloween':
        {
          return HalloweenTheme.NormalSquare;
        }
      default:
        {
          // same has light
          return LightTheme.NormalSquare;
        }
    }
  }

  Color jokerPlacementColor(String theme) {
    switch (theme) {
      case 'light':
        {
          return LightTheme.PlacedJoker;
        }
      case 'dark':
        {
          return DarkTheme.PlacedJoker;
        }
      case 'uni':
        {
          return UniTheme.PlacedJoker;
        }
      case 'fallGuys':
        {
          return FallGuysTheme.PlacedJoker;
        }
      case 'minecraft':
        {
          return MinecraftTheme.PlacedJoker;
        }
      case 'bubbleTea':
        {
          return BubbleTeaTheme.PlacedJoker;
        }
      case 'halloween':
        {
          return HalloweenTheme.PlacedJoker;
        }
      default:
        {
          // same has light
          return LightTheme.PlacedJoker;
        }
    }
  }

  // Color tileColor(String theme, Tile tile, bool isPlayerTurn) {
  //   if (tile.state == TileState.easel && !isPlayerTurn) {
  //     return (theme == 'dark')
  //         ? tileColorNotPlayingDark
  //         : tileColorNotPlayingLight;
  //   }
  //   return (theme == 'dark') ? tileColorDark : tileColorLight;
  // }

  Color tileColor(String theme, Tile tile, bool isPlayerTurn) {
    if (tile.state == TileState.easel && !isPlayerTurn) {
      switch (theme) {
        case 'light':
          {
            return LightTheme.LetterNotItsTurn;
          }
        case 'dark':
          {
            return DarkTheme.LetterNotItsTurn;
          }
        case 'uni':
          {
            return UniTheme.LetterNotItsTurn;
          }
        case 'fallGuys':
          {
            return FallGuysTheme.LetterNotItsTurn;
          }
        case 'minecraft':
          {
            return MinecraftTheme.LetterNotItsTurn;
          }
        case 'bubbleTea':
          {
            return BubbleTeaTheme.LetterNotItsTurn;
          }
        case 'halloween':
          {
            return HalloweenTheme.LetterNotItsTurn;
          }
        default:
          {
            // same has light
            return LightTheme.LetterNotItsTurn;
          }
      }
    } else {
      switch (theme) {
        case 'light':
          {
            return LightTheme.Letter;
          }
        case 'dark':
          {
            return DarkTheme.Letter;
          }
        case 'uni':
          {
            return UniTheme.Letter;
          }
        case 'fallGuys':
          {
            return FallGuysTheme.Letter;
          }
        case 'minecraft':
          {
            return MinecraftTheme.Letter;
          }
        case 'bubbleTea':
          {
            return BubbleTeaTheme.Letter;
          }
        case 'halloween':
          {
            return HalloweenTheme.Letter;
          }
        default:
          {
            // same has light
            return LightTheme.Letter;
          }
      }
    }
  }

  // Color easelBorderColor(String theme) {
  //   return (theme == 'dark') ? easelBorderColorDark : easelBorderColorLight;
  // }
  Color easelBorderColor(String theme) {
    switch (theme) {
      case 'light':
        {
          return LightTheme.EaselBorder;
        }
      case 'dark':
        {
          return DarkTheme.EaselBorder;
        }
      case 'uni':
        {
          return UniTheme.EaselBorder;
        }
      case 'fallGuys':
        {
          return FallGuysTheme.EaselBorder;
        }
      case 'minecraft':
        {
          return MinecraftTheme.EaselBorder;
        }
      case 'bubbleTea':
        {
          return BubbleTeaTheme.EaselBorder;
        }
      case 'halloween':
        {
          return HalloweenTheme.EaselBorder;
        }
      default:
        {
          // same has light
          return LightTheme.EaselBorder;
        }
    }
  }

  // Color placementCursorColor(String theme) {
  //   return (theme == 'dark')
  //       ? placementCursorColorDark
  //       : placementCursorColorLight;
  // }

  Color placementCursorColor(String theme) {
    switch (theme) {
      case 'light':
        {
          return LightTheme.PlacementCursor;
        }
      case 'dark':
        {
          return DarkTheme.PlacementCursor;
        }
      case 'uni':
        {
          return UniTheme.PlacementCursor;
        }
      case 'fallGuys':
        {
          return FallGuysTheme.PlacementCursor;
        }
      case 'minecraft':
        {
          return MinecraftTheme.PlacementCursor;
        }
      case 'bubbleTea':
        {
          return BubbleTeaTheme.PlacementCursor;
        }
      case 'halloween':
        {
          return HalloweenTheme.PlacementCursor;
        }
      default:
        {
          // same has light
          return LightTheme.PlacementCursor;
        }
    }
  }
  Color tileBoarderPlaced(String theme) {
    switch (theme) {
      case 'light':
        {
          return LightTheme.LetterBoarderPlaced;
        }
      case 'dark':
        {
          return DarkTheme.LetterBoarderPlaced;
        }
      case 'uni':
        {
          return UniTheme.LetterBoarderPlaced;
        }
      case 'fallGuys':
        {
          return FallGuysTheme.LetterBoarderPlaced;
        }
      case 'minecraft':
        {
          return MinecraftTheme.LetterBoarderPlaced;
        }
      case 'bubbleTea':
        {
          return BubbleTeaTheme.LetterBoarderPlaced;
        }
      case 'halloween':
        {
          return HalloweenTheme.LetterBoarderPlaced;
        }
      default:
        {
          // same has light
          return LightTheme.LetterBoarderPlaced;
        }
    }
  }
    Color tileBoarderExchange(String theme) {
      switch (theme) {
        case 'light':
          {
            return LightTheme.LetterBoarderexchange;
          }
        case 'dark':
          {
            return DarkTheme.LetterBoarderexchange;
          }
        case 'uni':
          {
            return UniTheme.LetterBoarderexchange;
          }
        case 'fallGuys':
          {
            return FallGuysTheme.LetterBoarderexchange;
          }
        case 'minecraft':
          {
            return MinecraftTheme.LetterBoarderexchange;
          }
        case 'bubbleTea':
          {
            return BubbleTeaTheme.LetterBoarderexchange;
          }
        case 'halloween':
          {
            return HalloweenTheme.LetterBoarderexchange;
          }
        default:
          {
            // same has light
            return LightTheme.LetterBoarderexchange;
          }
      }
    }
  }
