import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:poly_scrabble/models/room.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/services/socket_service.dart';

class InvitationService extends ChangeNotifier {
  final Room room;
  final SocketService socketService;
  final UserModel userModel;
  InvitationService(this.room, this.socketService, this.userModel) {}
  initializeRoom(Room room) {
    //set up
    room = room;
    //
  }

  listenInvitation() {
    log("listenInvitation");
    socketService.on('invite-friend',
        (invitation) => {initializeRoom(room), log("got the invitation")});
  }
}
