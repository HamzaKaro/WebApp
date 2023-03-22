import 'package:poly_scrabble/models/room.dart';

class Invitation {
  late String emailSender;
  late String usernameSender;
  late String usernameReceiver;
  late String emailReceiver;
  late Room room;

  Invitation() {
    emailSender = '';
    usernameSender = '';
    emailReceiver = '';
    usernameReceiver = '';
    room = Room();
  }

  Map toJson() => {
        'emailSender': emailSender,
        'usernameSender': usernameSender,
        'emailReceiver': emailReceiver,
        'usernameReceiver': usernameReceiver,
        'room': room,
      };
}
