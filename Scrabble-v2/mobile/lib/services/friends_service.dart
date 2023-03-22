import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';

import 'socket_service.dart';

class FriendsService extends ChangeNotifier {
  final SocketService socketService;
  var activeUsers = BehaviorSubject<List>();
  var usersInGame = BehaviorSubject<List>();

  FriendsService(this.socketService) {
    setSocketListeners();
  }

  void setSocketListeners() {
    socketService.on('active-user-modified', (data) {
      try {
        log("friendService: " + data['message'].toString());
        activeUsers.value = data['message'];
        notifyListeners();
      } catch (e) {
        log("Error while changing turn ${e.toString()}");
      }
    });
    socketService.on('users-in-game', (data) {
      try {
        log("friendService: " + data['message'].toString());
        usersInGame.value = data['message'];
        notifyListeners();
      } catch (e) {
        log("Error while changing turn ${e.toString()}");
      }
    });
  }
}
