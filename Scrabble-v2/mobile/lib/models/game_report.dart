class PlayerGameReport {
  final String startDatetime;
  final int gameDuration;
  final String endType;
  final int score;

  PlayerGameReport({
    required this.startDatetime,
    required this.gameDuration,
    required this.endType,
    required this.score,
  });

  factory PlayerGameReport.fromJson(Map<String, dynamic> json) {
    return PlayerGameReport(
        startDatetime: json['joinTime'],
        gameDuration: json['gameDuration']?? 0,
        endType: json['endType'],
        score: json['score']);
  }
}
