import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/models/invitation.dart';
import 'package:poly_scrabble/screens/join_room_screen.dart';
import 'package:poly_scrabble/services/rooms_service.dart';
import 'package:provider/provider.dart';

import '../models/user.dart';

class InvitationPopup extends StatelessWidget {
  final Invitation invitation;
  // final List<Widget> actions;

  const InvitationPopup({
    super.key,
    required this.invitation,
    // this.actions = const [],
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
        title: Text('Invitation'),
        // actions: this.actions,
        content: Column(mainAxisSize: MainAxisSize.min, children: <Widget>[
          Row(
            children: [
              Text(invitation.usernameSender +
                  translate("friend.message_invitation"))
            ],
          ),
          Row(
            children: [
              ElevatedButton(
                  onPressed: () {
                    Provider.of<RoomService>(context, listen: false).askToJoin(
                        invitation.room,
                        Provider.of<UserModel>(context, listen: false).player);
                    showDialog(
                        context: context,
                        builder: (context) => const JoinRoomScreen());
                  },
                  child: Text(translate("friend.accept_invitation"))),
              ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                  ),
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text(translate("friend.deny_invitation")))
            ],
          ),
        ]));
  }
}
