import 'package:assets_audio_player/assets_audio_player.dart';
import 'package:flutter/cupertino.dart';

import '../constants/sound_effects.dart' as sound_effects;

class SoundService extends ChangeNotifier {
  bool turnOn = true;
  SoundService(this.turnOn);

  String findAudioSrc(String typeSound) {
    String prefixSrc = '/assets/audio/';
    return prefixSrc + sound_effects.SOUNDS_MAP[typeSound].toString();
  }

  Future<void> controllerSound(String typeSound) async {
    AssetsAudioPlayer audioplayer = AssetsAudioPlayer();
    if (turnOn) {
      audioplayer.open(Audio(findAudioSrc(typeSound)));
      audioplayer.setVolume(sound_effects.moderateVolumeLevel);
      await audioplayer.play();
    } else {
      await audioplayer.stop();
    }
  }
}
