import 'package:flutter/cupertino.dart';

// TITLE //
const String titleConfigurationPage = "Configuration d'une partie de jeu";
const String titleScrabbleClassic = "Scrabble Classique";

// ICON FIELD FORM //
const IconData iconLevel = IconData(0xf01bc, fontFamily: 'MaterialIcons');
const IconData iconPseudo = IconData(0xe743, fontFamily: 'MaterialIcons');
const IconData iconTimer = IconData(0xee2d, fontFamily: 'MaterialIcons');
const IconData iconMultiplayer = IconData(0xe61f, fontFamily: 'MaterialIcons');
const IconData iconPrivacyGame = IconData(0xe4ed, fontFamily: 'MaterialIcons');

// BOUNDARIES OF NUMBER INPUT INCR AND DECR FORM //
const minNbPlayers = 2;
const maxNbPlayers = 4;
const incDecFactorFixed = 1;
const initalValueFixed = 2;

// LEVEL GAME //
final List<Map<String, dynamic>> levelGame = [
  {
    'value': 'easyLevel',
    'label': 'Débutant',
  },
  {
    'value': 'hardLevel',
    'label': 'Expert',
  },
];

// DICTIONARIES PATH //
const pathDefaultDictionary = '/dictionnaire-par-defaut.json';
