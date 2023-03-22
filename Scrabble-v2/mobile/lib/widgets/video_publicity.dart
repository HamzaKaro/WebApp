import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/constants/constants.dart';
import 'package:provider/provider.dart';
import 'package:video_player/video_player.dart';

import '../models/user.dart';
import '../services/http/http_user_data.dart';
import '../services/popup_service.dart';

// https://docs.flutter.dev/cookbook/plugins/play-video
class VideoPublicity extends StatefulWidget {
  const VideoPublicity({Key? key}) : super(key: key);

  @override
  State<VideoPublicity> createState() => _VideoPublicityState();
}

class _VideoPublicityState extends State<VideoPublicity> {
  late VideoPlayerController _controller;
  late Future<void> _initializeVideoPlayerFuture;
  late bool videoEnded;
  late bool rewardClaimed;
  @override
  void initState() {
    _controller = VideoPlayerController.asset('assets/videos/publicity.mp4');
    _initializeVideoPlayerFuture = _controller.initialize();
    _controller.addListener(checkVideo);
    _controller.setLooping(false);
    _controller.setVolume(50.0);
    videoEnded = false;
    rewardClaimed = false;
    super.initState();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void checkVideo() {
    if (_controller.value.position == _controller.value.duration) {
      setState(() {
        videoEnded = true;
      });
    }
  }

  void claimReward() {
    try {
      HttpUserData.addCoins(
              Provider.of<UserModel>(context, listen: false).email,
              PUBLICITY_COINS_REWARD)
          .then((value) {
        if (value.isNotEmpty) {
          PopupService.openErrorPopup(value, context);
          return;
        }

        setState(() {
          rewardClaimed = true;
          Provider.of<UserModel>(context, listen: false).coins +=
              PUBLICITY_COINS_REWARD;
        });
      });
    } catch (e) {
      var error_messages;
      PopupService.openErrorPopup(error_messages.unknownError, context);
      return;
    }
  }

  Widget getVideo() {
    if (rewardClaimed) return Center();
    return Column(
      children: [
        FutureBuilder(
            // initialData: FloatingActionButton(onPressed: () {  }, child: Icon(_controller.value.isPlaying ? Icons.pause : Icons.play_arrow)),
            future: _initializeVideoPlayerFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.done) {
                return AspectRatio(
                    aspectRatio: _controller.value.aspectRatio,
                    child: VideoPlayer(_controller));
              } else {
                return const Center(child: CircularProgressIndicator());
              }
            }),
        FloatingActionButton(
            onPressed: () {
              setState(() {
                if (_controller.value.isPlaying) {
                  _controller.pause();
                } else {
                  _controller.play();
                }
              });
            },
            child: Icon(
                _controller.value.isPlaying ? Icons.pause : Icons.play_arrow)),
        ElevatedButton(
            // Trick to disable a button (null callback fct disables the button)
            onPressed: ((videoEnded && rewardClaimed) || !videoEnded)
                ? null
                : () {
                    claimReward();
                  },
            child: Text(translate("publicity.obtain_reward"))),
      ],
    );
  }

  Widget getSuccessMessage() {
    if (!rewardClaimed) return Center();
    return Container(
        width: 500.0,
        height: 30.0,
        margin: const EdgeInsets.all(15.0),
        padding: const EdgeInsets.all(3.0),
        decoration: BoxDecoration(
          border: Border.all(color: Color(0xff1952a7)),
          color: Color.fromRGBO(216, 227, 250, 1),
        ),
        child: Row(
          children: [
            const Expanded(
              flex: 1,
              child: Text("( ! )", style: TextStyle(color: Colors.black)),
            ),
            const Expanded(
              flex: 2,
              child: Text("", style: TextStyle(color: Colors.black)),
            ),
            Expanded(
              flex: 8,
              child: Text(translate('publicity.congrats_message'),
                  style: TextStyle(color: Colors.black)),
            )
          ],
        ));
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 550,
      child: Column(children: [
        getVideo(),
        getSuccessMessage(),
      ]),
    );
  }
}
