import 'package:flutter/material.dart';
import 'package:poly_scrabble/models/game_report.dart';

/// An example of the outlined card type.
///
/// To make a [Card] match the outlined type, the default elevation and shape
/// need to be changed to the values from the spec:
///
/// https://m3.material.io/components/cards/specs#0f55bf62-edf2-4619-b00d-b9ed462f2c5a
class GameReportCard extends StatelessWidget {
  final PlayerGameReport gameReport;

  const GameReportCard({super.key, required this.gameReport});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: BorderSide(
            color: Theme.of(context).colorScheme.outline,
          ),
          borderRadius: const BorderRadius.all(Radius.circular(12)),
        ),
        child: SizedBox(
          width: 300,
          height: 75,
          child: Center(
              child: Column(
            children: [
              Text(gameReport.startDatetime),
              Text(handleGameDuration(gameReport.gameDuration)),
              Text(gameReport.endType),
              Text('${gameReport.score.toString()} points'),
            ],
          )),
        ),
      ),
    );
  }

  String handleGameDuration(int gameDuration) {


    return '${(gameDuration / (60 * 1000)).round()} min';
  }
}
