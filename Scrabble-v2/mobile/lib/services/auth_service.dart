import 'dart:convert';
import 'dart:developer';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:poly_scrabble/constants/error_messages.dart' as error_messages;

import '../models/user.dart';

class AuthResponse {
  final UserInfo? user;
  final String error;

  AuthResponse({required this.user, required this.error});
}

class AuthService {
  static Future<AuthResponse> login(
      {required String email, required String password}) async {
    try {
      print('serverurl ${dotenv.get('SERVER_URL')}');
      var response = await http
          .post(Uri.parse('${dotenv.get('SERVER_URL')}/api/user/login'), body: {
        'email': email,
        'password': password,
      });
      switch (response.statusCode) {
        case 202:
          var user = UserInfo.fromJson(jsonDecode(response.body));
          return AuthResponse(user: user, error: '');
        case 401:
          return AuthResponse(
              user: null, error: error_messages.invalidCredentials);
        case 409:
          return AuthResponse(
              user: null, error: error_messages.alreadyConnected);
        default:
          return AuthResponse(user: null, error: error_messages.unknownError);
      }
    } catch (e) {
      log(e.toString());
      return AuthResponse(
          user: null, error: error_messages.cantConnectTryLater);
    }
  }

  static Future<AuthResponse> signUp(
      {required String username,
      required String email,
      required String password,
      required String avatar}) async {
    try {
      var response = await http.post(
          Uri.parse('${dotenv.get('SERVER_URL')}/api/user/create'),
          body: {
            'email': email,
            'password': password,
            'username': username,
            'avatar': avatar,
          });
      switch (response.statusCode) {
        case 201:
          var user = UserInfo.fromJson(jsonDecode(response.body));
          log(user.username);
          return AuthResponse(user: user, error: '');
        case 417:
          return AuthResponse(
              user: null, error: error_messages.accountAlreadyExistsWithEmail);

        case 409:
          return AuthResponse(
              user: null, error: error_messages.pseudoAlreadyTaken);

        default:
          return AuthResponse(user: null, error: error_messages.unknownError);
      }
    } catch (e) {
      log('Error while signing up ${e}');
      return AuthResponse(user: null, error: error_messages.unknownError);
    }
  }

  static Future<void> logout(String username) async {
    try {
      http.post(Uri.parse('${dotenv.get('SERVER_URL')}/api/user/logout'),
          body: {
            'username': username,
          });
    } catch (e) {
      log('Error logging out: $e');
    }
  }
}
