import 'dart:convert';
import 'dart:developer';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:poly_scrabble/constants/error_messages.dart' as error_messages;
import 'package:poly_scrabble/models/game_report.dart';
import 'package:poly_scrabble/models/user.dart';

class RatingResponse {
  final String error;
  final double average;
  RatingResponse({required this.error, required this.average});
}

class Rating {
  final double average;

  Rating({required this.average});

  factory Rating.fromJson(Map<String, dynamic> json) {
    return Rating(average: json['average']);
  }
}

class UserStatistics {
  final int nGamesPlayed;
  final int nGamesWon;
  final int averageGamePoints;
  final int averageGameDuration;

  UserStatistics({
    required this.nGamesPlayed,
    required this.nGamesWon,
    required this.averageGamePoints,
    required this.averageGameDuration,
  });

  factory UserStatistics.fromJson(Map<String, dynamic> json) {
    return UserStatistics(
        nGamesPlayed: json['nGamesPlayed'],
        nGamesWon: json['nGamesWon'],
        averageGamePoints: json['averageGamePoints'],
        averageGameDuration: json['averageGameDuration']);
  }
}

class HttpUserData {
  static Future<RatingResponse> getRatingsAverage() async {
    try {
      var response = await http.get(
          Uri.parse('${dotenv.get('SERVER_URL')}/api/user/ratings-average'));
      switch (response.statusCode) {
        case 200:
          // Parse the body of the response
          var rating = Rating.fromJson(jsonDecode(response.body));
          return RatingResponse(average: rating.average, error: '');
        case 401:
          return RatingResponse(
              average: 0, error: error_messages.invalidCredentials);

        default:
          return RatingResponse(average: 0, error: error_messages.unknownError);
      }
    } catch (e) {
      log(e.toString());
      return RatingResponse(average: 0, error: error_messages.unknownError);
    }
  }

  // Returns UserStatistics || null
  static Future<dynamic> getStatistics(String email) async {
    try {
      var response = await http.get(
        Uri.parse(
            '${dotenv.get('SERVER_URL')}/api/user/statistics?email=${email}'),
      );
      if (response.statusCode != 200) return null;
      return UserStatistics.fromJson(jsonDecode(response.body));
    } catch (e) {
      log(e.toString());
      return null;
    }
  }

  static Future<dynamic> getUserCoins(String email) async {
    try {
      log("http.getUse");
      var response = await http.patch(
          Uri.parse('${dotenv.get('SERVER_URL')}/api/user/user-coins'),
          body: {
            'email': email,
          });

      if (response.statusCode != 200) return null;
      return UserInfo.fromJson(jsonDecode(response.body));
    } catch (e) {
      log(e.toString());
      return null;
    }
  }

  // Returns GameReport[] || null
  static Future<List<PlayerGameReport>> getGamesStatistics(String email) async {
    try {
      var response = await http.get(
        Uri.parse(
            '${dotenv.get('SERVER_URL')}/api/user/games-statistics?email=$email'),
      );
      if (response.statusCode != 200) return [];
      List<PlayerGameReport> gameReports = [];
      var body = jsonDecode(response.body);
      for (var i = 0; i < body.length; i++) {
        gameReports.add(PlayerGameReport.fromJson(body[i]));
      }
      return gameReports;
    } catch (e) {
      log(e.toString());
      return [];
    }
  }

  static Future<String> updateRating(String email, int rating) async {
    try {
      var response = await http.patch(
          Uri.parse('${dotenv.get('SERVER_URL')}/api/user/update-ratings'),
          body: {
            'email': email,
            'rating': jsonEncode(rating),
          });
      switch (response.statusCode) {
        case 200:
          return '';
        default:
          return error_messages.unknownError;
      }
    } catch (e) {
      return error_messages.unknownError;
    }
  }

  // TODO : remove this ! C'est seulement temporaire
  static Future<String> simulateEndGame(String email) async {
    try {
      var response = await http.post(
          Uri.parse('${dotenv.get('SERVER_URL')}/api/user/simulate-end-game'),
          body: {
            'email': email,
          });
      switch (response.statusCode) {
        case 200:
          return '';
        default:
          return error_messages.unknownError;
      }
    } catch (e) {
      return error_messages.unknownError;
    }
  }

  static Future<String> updateAvatar(String email, String avatar) async {
    try {
      var response = await http.patch(
          Uri.parse('${dotenv.get('SERVER_URL')}/api/user/update-avatar'),
          body: {
            'email': email,
            'avatar': avatar,
          });
      switch (response.statusCode) {
        case 200:
          return '';
        default:
          return error_messages.unknownError;
      }
    } catch (e) {
      return error_messages.unknownError;
    }
  }

  static Future<String> updatePseudo(String email, String pseudo) async {
    try {
      var response = await http.patch(
          Uri.parse('${dotenv.get('SERVER_URL')}/api/user/update-pseudo'),
          body: {
            'email': email,
            'pseudo': pseudo,
          });
      switch (response.statusCode) {
        case 200:
          return '';

        case 403:
          return error_messages.pseudoAlreadyTaken;
        default:
          return error_messages.unknownError;
      }
    } catch (e) {
      return error_messages.unknownError;
    }
  }

  static Future<String> addCoins(String email, int coins) async {
    try {
      var response = await http.patch(
          Uri.parse('${dotenv.get('SERVER_URL')}/api/user/add-coins'),
          body: {
            'email': email,
            'coins': jsonEncode(coins),
          });
      switch (response.statusCode) {
        case 200:
          return '';
        case 401:
          return error_messages.invalidCredentials;

        default:
          return error_messages.unknownError;
      }
    } catch (e) {
      return error_messages.unknownError;
    }
  }

  static Future<String> addTheme(
      String email, List<String> themesPreferenceList) async {
    try {
      var response = await http.patch(
        Uri.parse('${dotenv.get('SERVER_URL')}/api/user/add-theme'),
        body: {
          'email': email,
          'themeToAdd': json.encode(themesPreferenceList.toList()),
        },
      );
      switch (response.statusCode) {
        case 200:
          return '';
        case 401:
          return error_messages.invalidCredentials;

        default:
          return error_messages.unknownError;
      }
    } catch (e) {
      return error_messages.unknownError;
    }
  }

  static Future<String> claimRatingReward(String email) async {
    try {
      var response = await http.patch(
          Uri.parse('${dotenv.get('SERVER_URL')}/api/user/claim-rating-reward'),
          body: {
            'email': email,
          });
      switch (response.statusCode) {
        case 200:
          return '';
        case 401:
          return error_messages.invalidCredentials;

        case 400:
          return error_messages.invalidCredentials;

        default:
          return error_messages.unknownError;
      }
    } catch (e) {
      return error_messages.unknownError;
    }
  }

  static Future<String> updateSettings(
      String email, UserPreferences userpreferences) async {
    try {
      log("http.updateSettings");
      var response = await http.patch(
          Uri.parse('${dotenv.get('SERVER_URL')}/api/user/update-settings'),
          body: {
            'email': email,
            'userpreferences': jsonEncode(userpreferences),
          });
      switch (response.statusCode) {
        case 200:
          return '';
        default:
          return error_messages.unknownError;
      }
    } catch (e) {
      return error_messages.unknownError;
    }
  }

  static Future<List<String>> getActiveUsers(String email) async {
    try {
      log("http.get-active-users");
      var list = <String>[];
      var response = await http.get(Uri.parse(
          '${dotenv.get('SERVER_URL')}/api/user/get-active-users?email=${email}'));
      switch (response.statusCode) {
        case 200:
          var json = jsonDecode(response.body);
          return List<String>.from(json);
        default:
          return list;
      }
    } catch (e) {
      throw error_messages.unknownError;
    }
  }

  static Future<List<String>> getUsersInGame(String email) async {
    try {
      log("http.get-users-in-game");
      var list = <String>[];
      var response = await http.get(Uri.parse(
          '${dotenv.get('SERVER_URL')}/api/user/get-users-in-game?email=${email}'));
      switch (response.statusCode) {
        case 200:
          var json = jsonDecode(response.body);
          return List<String>.from(json);
        default:
          return list;
      }
    } catch (e) {
      throw error_messages.unknownError;
    }
  }

  static Future<List<String>> getFriends(String email) async {
    try {
      log("http.add-friend");
      var list = <String>[];
      var response = await http.get(Uri.parse(
          '${dotenv.get('SERVER_URL')}/api/user/get-friends?email=${email}'));

      switch (response.statusCode) {
        case 200:
          var json = jsonDecode(response.body);
          log("Inch allah ");
          return List<String>.from(json);
        default:
          return list;
      }
    } catch (e) {
      throw error_messages.unknownError;
    }
  }

  static Future<List<String>> getUncontactedFriends(String email) async {
    try {
      log("http.add-friend");
      var list = <String>[];
      var response = await http.get(Uri.parse(
          '${dotenv.get('SERVER_URL')}/api/user/get-friends?email=${email}'));

      switch (response.statusCode) {
        case 200:
          var json = jsonDecode(response.body);
          log("Inch allah ");
          return List<String>.from(json);
        default:
          return list;
      }
    } catch (e) {
      throw error_messages.unknownError;
    }
  }

  static Future<UserInfo> getUser(String email) async {
    var usermodel;
    try {
      log("http.get-user");
      var response = await http.get(
        Uri.parse(
            '${dotenv.get('SERVER_URL')}/api/user/get-user?email=${email}'),
      );
      usermodel = UserInfo.fromJson(jsonDecode(response.body));
      log("ojoaj: " + usermodel.email);
      return usermodel;
    } catch (e) {
      return usermodel;
    }
  }

  static Future<String> addFriend(String email, String usernameToAdd) async {
    try {
      log("http.add-friend");
      var response = await http.patch(
          Uri.parse('${dotenv.get('SERVER_URL')}/api/user/add-friend'),
          body: {
            'email': email,
            'usernameToAdd': usernameToAdd,
          });
      switch (response.statusCode) {
        case 200:
          return ("Success");
        case 400:
          return ("Error");
        default:
          return error_messages.unknownError;
      }
    } catch (e) {
      return error_messages.unknownError;
    }
  }

  static Future<String> removeFriend(String email, String emailToRemove) async {
    try {
      log("http.remove-friend");
      var response = await http.patch(
          Uri.parse('${dotenv.get('SERVER_URL')}/api/user/remove-friend'),
          body: {
            'email': email,
            'emailToRemove': emailToRemove,
          });
      switch (response.statusCode) {
        case 200:
          return '';
        default:
          return error_messages.unknownError;
      }
    } catch (e) {
      return error_messages.unknownError;
    }
  }
}
