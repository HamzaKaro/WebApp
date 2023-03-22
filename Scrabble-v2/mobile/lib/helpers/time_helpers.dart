import 'package:poly_scrabble/constants/constants.dart';

String formatTime(int time) {
  int minutes = (time / secondsPerMinute).floor();
  int seconds = time % secondsPerMinute;

  return "${minutes < decimalBase ? '0' : ''}$minutes:${seconds < decimalBase ? '0' : ''}$seconds";
}
