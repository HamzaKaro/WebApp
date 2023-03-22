import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../services/services.dart';

class Clock extends StatelessWidget {
  const Clock({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: Colors.black,
          width: 2,
        ),
      ),
      child: Consumer<GameService>(builder: (context, game, child) {
        return Text(game.remainingTime(),
            style: const TextStyle(fontSize: 24, color: Colors.black));
      }),
    );
  }
}
