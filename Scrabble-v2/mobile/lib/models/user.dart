import 'package:flutter/material.dart';
import 'package:poly_scrabble/models/shop/catalog.dart';

import 'player.dart';

class UserPreferences {
  String theme = 'light';
  String language = 'en';
  bool visualAnimations = true;
  bool soundAnimations = true;

  UserPreferences({
    required this.theme,
    required this.language,
    required this.visualAnimations,
    required this.soundAnimations,
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      theme: json['theme'],
      language: json['language'],
      visualAnimations: json['visualAnimations'],
      soundAnimations: json['soundAnimations'],
    );
  }
  Map toJson() {
    return {
      'theme': theme,
      'language': language,
      'visualAnimations': visualAnimations,
      'soundAnimations': soundAnimations
    };
  }
}

class UserInfo {
  String username;
  String email;
  int elo = 0;
  int coins = 0;
  List<String> friends = [];
  String avatar;
  List<String> channels = [];
  int rating = 0;
  bool receivedRatingReward = false;
  bool isAdmin = false;
  UserPreferences preferences = UserPreferences(
    theme: 'light',
    language: 'en',
    visualAnimations: true,
    soundAnimations: true,
  );
  List<String> connexions = [];
  List<String> deconnexions = [];
  List<String> themes = [];

  UserInfo(
      {required this.username,
      required this.email,
      required this.avatar,
      required this.elo,
      required this.coins,
      required this.rating,
      required this.receivedRatingReward,
      required this.connexions,
      required this.deconnexions,
      required this.preferences,
      required this.friends,
      required this.themes,
      this.isAdmin = false});

  factory UserInfo.fromJson(Map<String, dynamic> json) {
    return UserInfo(
      username: json['username'],
      email: json['email'],
      avatar: json['avatar'],
      elo: json['elo'] ?? 0,
      coins: json['coins'] ?? 0,
      rating: json['rating'] ?? 0,
      receivedRatingReward: json['receivedRatingReward'] ?? false,
      connexions: List<String>.from(json['connexions']) ?? [],
      deconnexions: List<String>.from(json['deconnexions']) ?? [],
      preferences: UserPreferences.fromJson(json['preferences']),
      friends: List<String>.from(json['friends']),
      isAdmin: json['isAdmin'] ?? false,
      // channels: json['channels']
      themes: List<String>.from(json['themes']) ?? [],
    );
  }
}

class UserModel extends ChangeNotifier {
  String username = '';
  String email = '';
  UserPreferences preferences = UserPreferences(
      theme: 'light',
      language: 'en',
      visualAnimations: true,
      soundAnimations: true);
  int elo = 0;
  int coins = 0;
  String avatar = '';
  String socketId = '';
  int rating = 0;
  bool receivedRatingReward = false;
  Player player = Player();
  bool isAdmin = false;
  List<String> connexions = [];
  List<String> deconnexions = [];
  List<String> themes = [];

  List<String> friends = [];
//   List<String> channels = [];

  void setUser(UserInfo user) {
    username = user.username;
    email = user.email;
    elo = user.elo;
    coins = user.coins;
    avatar = user.avatar;
    rating = user.rating;
    receivedRatingReward = user.receivedRatingReward;
    connexions = user.connexions;
    deconnexions = user.deconnexions;
    preferences = user.preferences;
    friends = user.friends;
    // channels = user.channels;
    player.pseudo = username;
    themes = user.themes;
    isAdmin = user.isAdmin;
    notifyListeners();
  }

  void setSocketId(String socketId) {
    socketId = socketId;
    player.socketId = socketId;
    notifyListeners();
  }

  void setUsername(String text) {
    username = text;
    notifyListeners();
  }

  void setAvatar(String newAvatar) {
    avatar = newAvatar;
    notifyListeners();
  }

  void setTheme(String newTheme) {
    preferences.theme = newTheme;
    notifyListeners();
  }

  void setLangue(String langue) {
    preferences.language = langue;
    notifyListeners();
  }

  void setThemes(List<Item> items) {
    items.forEach((element) {
      if (!themes.contains(element.name)) {
        themes.add(element.name);
      }
    });
    notifyListeners();
  }

  void removeCoins(int coinsToRemove) {
    coins -= coinsToRemove;
    notifyListeners();
  }

  void reset() {
    preferences = UserPreferences(
        theme: 'light',
        language: 'en',
        visualAnimations: true,
        soundAnimations: true);
    notifyListeners();
  }
}
