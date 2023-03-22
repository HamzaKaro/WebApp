import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:poly_scrabble/services/material_colors_service.dart';

class Styles {
  static ThemeData themeTestData(bool isDarkTheme, BuildContext context) {
    return ThemeData(
      scaffoldBackgroundColor: isDarkTheme ? Colors.black : Color(0xffF1F5FB),
      primarySwatch: Colors.red,
      primaryColor: isDarkTheme ? Colors.black : Colors.white,
      backgroundColor: isDarkTheme ? Colors.black : Color(0xffF1F5FB),
      indicatorColor: isDarkTheme ? Color(0xff0E1D36) : Color(0xffCBDCF8),
      hintColor: isDarkTheme ? Color(0xff280C0B) : Color(0xffEECED3),
      highlightColor: isDarkTheme ? Color(0xff372901) : Color(0xffFCE192),
      hoverColor: isDarkTheme ? Color(0xff3A3A3B) : Color(0xff4285F4),
      focusColor: isDarkTheme ? Color(0xff0B2512) : Color(0xffA8DAB5),
      disabledColor: Colors.grey,
      cardColor: isDarkTheme ? Color(0xFF151515) : Colors.white,
      canvasColor: isDarkTheme ? Colors.black : Colors.grey[50],
      brightness: isDarkTheme ? Brightness.dark : Brightness.light,
      buttonTheme: Theme.of(context).buttonTheme.copyWith(
          colorScheme: isDarkTheme ? ColorScheme.dark() : ColorScheme.light()),
      appBarTheme: AppBarTheme(
        elevation: 0.0,
      ),
      textSelectionTheme: TextSelectionThemeData(
          selectionColor: isDarkTheme ? Colors.white : Colors.black),
    );
  }

  static ThemeData themeData(String mode, BuildContext context) {
    return ThemeData(
      // COLOR OF HOMEPAGE, SCRABBLE CLASSIC, STORE AND TUTORIAL PAGE BACKGROUND
      scaffoldBackgroundColor: mode == "dark"
          ? Color.fromARGB(255, 16, 18, 22)
          : mode == "uni"
              ? createMaterialColor(const Color(0xFFCADDEE))
              : mode == "fallGuys"
                  ? createMaterialColor(const Color(0xFF732299))
                  : mode == "minecraft"
                      ? createMaterialColor(Color(0xFF04230F))
                      : mode == "bubbleTea"
                          ? createMaterialColor(Color(0xFFb9b8f5))
                          : mode == "halloween"
                              ? createMaterialColor(Color(0xFF000000))
                              : (mode == "light")
                                  ? Color(0xffF1F5FB)
                                  : Color(0xffF1F5FB),
      // COLOR OF BUTTONS FROM HOMEPAGE, SCRABBLE CLASSIC, STORE AND TUTORIAL PAGE BACKGROUND
      primarySwatch: mode == "dark"
          ? createMaterialColor(Colors.green)
          : mode == "uni"
              ? createMaterialColor(const Color.fromRGBO(37, 7, 122, 1))
              : mode == "fallGuys"
                  ? createMaterialColor(const Color.fromRGBO(37, 7, 122, 1))
                  : mode == "minecraft"
                      ? createMaterialColor(
                          const Color.fromRGBO(125, 74, 13, 1))
                      : mode == "bubbleTea"
                          ? createMaterialColor(
                              const Color.fromRGBO(131, 96, 231, 1))
                          : mode == "halloween"
                              ? createMaterialColor(
                                  const Color.fromRGBO(103, 19, 1, 1))
                              : (mode == "light")
                                  ? Colors.green
                                  : Colors.green,
      focusColor: mode == "dark"
          ? createMaterialColor(Colors.green)
          : mode == "uni"
              ? createMaterialColor(const Color.fromRGBO(37, 7, 122, 1))
              : mode == "fallGuys"
                  ? createMaterialColor(const Color.fromRGBO(37, 7, 122, 1))
                  : mode == "minecraft"
                      ? createMaterialColor(
                          const Color.fromRGBO(125, 74, 13, 1))
                      : mode == "bubbleTea"
                          ? createMaterialColor(
                              Color.fromARGB(255, 168, 149, 218))
                          : mode == "halloween"
                              ? createMaterialColor(
                                  const Color.fromRGBO(103, 19, 1, 1))
                              : (mode == "light")
                                  ? Colors.green
                                  : Colors.green,
      primaryColor: mode == "dark"
          ? Colors.black
          : (mode == "light")
              ? Colors.white
              : Colors.white,
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10.0),
          borderSide: BorderSide(width: 3, color: Colors.greenAccent),
        ),
      ),
      backgroundColor: mode == "dark"
          ? Colors.black
          : (mode == "light")
              ? Color(0xffF1F5FB)
              : Color(0xffF1F5FB),
      indicatorColor: (mode == "dark" ||
              mode == 'halloween' ||
              mode == 'minecraft' ||
              mode == 'bubbleTea' ||
              mode == 'uni' ||
              mode == 'fallGuys')
          ? Color(0xff0E1D36)
          : (mode == "light")
              ? Color(0xffCBDCF8)
              : Color(0xffCBDCF8),
      hintColor: (mode == "dark" ||
              mode == 'halloween' ||
              mode == 'minecraft' ||
              mode == 'uni' ||
              mode == 'fallGuys')
          ? Colors.white
          : (mode == "light" || mode == 'bubbleTea')
              ? Colors.grey
              : Colors.grey,
      highlightColor: mode == "dark"
          ? Color(0xff372901)
          : (mode == "light")
              ? Color(0xffFCE192)
              : Color(0xffFCE192),
      hoverColor: mode == "dark"
          ? Color(0xff3A3A3B)
          : (mode == "light")
              ? Color(0xff4285F4)
              : Color(0xff4285F4),

      disabledColor: Colors.grey,
      // COLOR OF SCROLL BAR OF SETTINGS MENU FROM HOMEPAGE
      cardColor: mode == "dark"
          ? createMaterialColor(Colors.green)
          : (mode == "light")
              ? Colors.white
              : mode == "uni"
                  ? createMaterialColor(Color.fromARGB(255, 215, 227, 239))
                  : mode == "fallGuys"
                      ? createMaterialColor(Color.fromARGB(255, 178, 171, 197))
                      : mode == "minecraft"
                          ? createMaterialColor(
                              Color.fromARGB(255, 183, 150, 105))
                          : mode == "bubbleTea"
                              ? createMaterialColor(
                                  Color.fromARGB(255, 203, 202, 250))
                              : mode == "halloween"
                                  ? createMaterialColor(
                                      Color.fromARGB(240, 200, 157, 121))
                                  : Colors.white,
      splashColor: (mode == "dark" || mode == 'halloween')
          ? Colors.white
          : mode == "light"
              ? Colors.black
              : (mode == 'bubbleTea' || mode == 'uni')
                  ? Colors.black
                  : (mode == 'minecraft' || mode == 'fallGuys')
                      ? Colors.white
                      : Colors.black,

      // COLOR OF SCROLL BAR THEME BACKGROUND FROM SETTINGS PAGE
      canvasColor: mode == "dark"
          ? Color(0xFF151515)
          : (mode == "light")
              ? Colors.white
              : mode == "uni"
                  ? createMaterialColor(Color(0xFFCADDEE))
                  : mode == "fallGuys"
                      ? createMaterialColor(Color(0xFF732299))
                      : mode == "minecraft"
                          ? createMaterialColor(Color(0xFF04230F))
                          : mode == "bubbleTea"
                              ? createMaterialColor(Color(0xFFb9b8f5))
                              : mode == "halloween"
                                  ? createMaterialColor(Color(0xFF000000))
                                  : Colors.white,
      // COLOR OF SETTINGS PAGE BACKGROUND
      // todo - if there is enough available time, do something to set a new colors to brightness
      // Status - can not modify the color of brightness
      brightness: mode == "dark"
          ? Brightness.dark
          : mode == "dark"
              ? Brightness.dark
              : mode == "light"
                  ? Brightness.light
                  : Brightness.light,
      buttonTheme: Theme.of(context).buttonTheme.copyWith(
          colorScheme: mode == "dark"
              ? ColorScheme.dark()
              : (mode == "light" || mode == '')
                  ? ColorScheme.light()
                  : ColorScheme.light()),
      appBarTheme: AppBarTheme(
        elevation: 0.0,
      ),
      textSelectionTheme: TextSelectionThemeData(
          selectionColor: mode == "dark"
              ? Colors.white
              : (mode == "light" || mode == '')
                  ? Colors.black
                  : Colors.black),
      textTheme: Theme.of(context).textTheme.apply(
          // COLOR OF TEXT SCROLL MENU AND TITLE MENU PAGE
          bodyColor: (mode == "dark" || mode == 'halloween')
              ? Colors.white
              : mode == "light"
                  ? Colors.black
                  : (mode == 'bubbleTea' || mode == 'uni')
                      ? Colors.black
                      : (mode == 'minecraft' || mode == 'fallGuys')
                          ? Colors.white
                          : Colors.black,
          displayColor: mode == "dark"
              ? Colors.white
              : (mode == "light")
                  ? Colors.black
                  : Colors.black //<-- SEE HERE
          ),
    );
  }
}
