import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../services/rooms_service.dart';

class ReturnButton extends StatelessWidget {
  final Route<dynamic> route;
  const ReturnButton({super.key, required this.route});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 300.0,
      height: 62.0,
      child: ElevatedButton(
        style: ButtonStyle(
          backgroundColor: MaterialStateProperty.all(Color(0xFFecba8c)),
        ),
        onPressed: () {
          Provider.of<RoomService>(context, listen: false).leaveRoom();
          Navigator.of(context).pushReplacement(route);
        },
        child: Text(translate('room.back'),
            style: TextStyle(
              color: Colors.black,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            )),
      ),
    );
  }
}
/// The base class for the different types of items the list can contain.