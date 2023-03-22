import 'package:flutter/material.dart';
import 'package:poly_scrabble/constants/board_constants.dart';

class Utilities {
  // https://en.wikipedia.org/wiki/French_orthography
  // Une adaptation de : https://stackoverflow.com/a/64742829
  static String removeDiacritics(String text) {
    if (frenchDiacritics.length != frenchDiacriticsWithoutAccents.length) {
      return text;
    }
    for (int i = 0; i < frenchDiacritics.length; i++) {
      text = text.replaceAll(frenchDiacritics[i], frenchDiacriticsWithoutAccents[i]);
    }
    print('on vous retourne $text');
    return text;
  }
}
