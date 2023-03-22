import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/models/game_report.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/services/http/http_user_data.dart';
import 'package:poly_scrabble/widgets/cards/game_report_card.dart';
import 'package:poly_scrabble/widgets/cards/text_card.dart';
import 'package:provider/provider.dart';

class StatisticsScreen extends StatefulWidget {
  const StatisticsScreen({super.key});

  @override
  State<StatisticsScreen> createState() => _StatisticsScreenState();
}

class _StatisticsScreenState extends State<StatisticsScreen> {
  String errorMessage = '';
  UserStatistics statistics = UserStatistics(
      nGamesPlayed: 0,
      nGamesWon: 0,
      averageGamePoints: 0,
      averageGameDuration: 0);
  List<PlayerGameReport> gamesPlayed = [];

  @override
  void initState() {
    // HttpUserData.getStatistics(
    //         Provider.of<UserModel>(context, listen: false).email)
    //     .then((value) {
    //   if (value == null) {
    //     return;
    //   } else if (value is UserStatistics) {
    //     setState(() {
    //       statistics = value;
    //     });
    //     return;
    //   } else {
    //     return;
    //   }
    // });
    getUserGamesPlayed();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('PolyScrabble'),
        ),
        body: Center(
          child: Form(
            child: Container(
              padding: const EdgeInsets.all(50),
              width: 800,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                //Center Column contents vertically,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    translate("statistics_page.title"),
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    //Center Column contents vertically,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      TextCard(
                          text:
                              '${translate("statistics_page.number_games_played")}${statistics.nGamesPlayed}'),
                      TextCard(
                          text:
                              '${translate("statistics_page.number_games_won")}${statistics.nGamesWon}'),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    //Center Column contents vertically,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      TextCard(
                          text:
                              '${translate("statistics_page.average_games_points")}${statistics.averageGamePoints} points'),
                      TextCard(
                          text:
                              '${translate("statistics_page.average_games_duration")}${(statistics.averageGameDuration / (60 * 1000)).round()} min'),
                    ],
                  ),
                  Text(
                    translate("statistics_page.games_history"),
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                  ),
                  getGamesPlayedCards(),
                ],
              ),
            ),
          ),
        ));
  }

  getUserGamesPlayed() {
    HttpUserData.getGamesStatistics(
            Provider.of<UserModel>(context, listen: false).email)
        .then((value) {
      if (value == null) {
        setState(() {
          gamesPlayed = [];
          statistics = createStatistics();
        });
        return;
      } else {
        setState(() {
          gamesPlayed = value;
          statistics = createStatistics();
        });
      }
    });
  }

  simulateEndGame() {
    HttpUserData.simulateEndGame(
            Provider.of<UserModel>(context, listen: false).email)
        .then((value) {});
  }

  UserStatistics createStatistics() {
    if (gamesPlayed.isEmpty) {
      return UserStatistics(
          nGamesPlayed: 0,
          nGamesWon: 0,
          averageGamePoints: 0,
          averageGameDuration: 0);
    }
    var averageDuration = 0;
    var averageScore = 0;
    var gamesWon = 0;
    for (var game in gamesPlayed) {
      averageScore += game.score;
      averageDuration += game.gameDuration;
      if (game.endType.toLowerCase() == 'v') {
        gamesWon += 1;
      }
    }
    averageScore ~/= gamesPlayed.length;
    averageDuration ~/= gamesPlayed.length;
    return UserStatistics(
        nGamesPlayed: gamesPlayed.length,
        nGamesWon: gamesWon,
        averageGamePoints: averageScore,
        averageGameDuration: averageDuration);
  }

  Widget getGamesPlayedCards() {
    return Container(
        // color: Colors.amber[500],
        height: 350,
        child: Center(
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: gamesPlayed.length,
            itemBuilder: (context, index) {
              return Center(
                  child: GameReportCard(
                gameReport: PlayerGameReport(
                    startDatetime: gamesPlayed[gamesPlayed.length - index - 1].startDatetime,
                    gameDuration: gamesPlayed[gamesPlayed.length - index - 1].gameDuration,
                    endType: getEndTypeText(gamesPlayed[gamesPlayed.length - index -1].endType),
                    score: gamesPlayed[gamesPlayed.length - index - 1].score),
              ));
            },
          ),
        ));
  }
  String getEndTypeText(endType) {
    if(endType.toLowerCase() == 'v') { return translate("statistics_page.win"); }
    if(endType.toLowerCase() == 'd') { return translate("statistics_page.defeat"); }
    if(endType.toLowerCase() == 'a') { return translate("statistics_page.abandon");}
    if(endType.toLowerCase() == 't') { return translate("statistics_page.draw"); }
    return '';
  }
}
