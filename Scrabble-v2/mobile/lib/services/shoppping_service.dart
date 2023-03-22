import 'dart:developer';

import 'package:flutter/cupertino.dart';
import 'package:poly_scrabble/services/socket_service.dart';
import 'package:rxdart/rxdart.dart';

class ShoppingService extends ChangeNotifier {
  final SocketService socketService;
  var userCoinsUpdated = BehaviorSubject();

  ShoppingService(
    this.socketService,
  ) {
    setSocketListeners();
  }

  void setSocketListeners() {
    socketService.on('active-user-modified', (data) {
      try {
        log("ShoppingService: " + data['message'].toString());
        userCoinsUpdated.value = data['message'];
        notifyListeners();
      } catch (e) {
        log("Error while changing turn ${e.toString()}");
      }
    });
  }
}
