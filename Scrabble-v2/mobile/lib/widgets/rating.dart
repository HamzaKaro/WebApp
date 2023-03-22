import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/constants/error_messages.dart' as error_messages;
import 'package:provider/provider.dart';

import '../constants/rating.dart';
import '../models/user.dart';
import '../services/http/http_user_data.dart';
import '../services/popup_service.dart';

// https://pub.dev/packages/flutter_rating_bar
class RatingWidget extends StatefulWidget {
  const RatingWidget({Key? key}) : super(key: key);

  @override
  State<RatingWidget> createState() => _RatingWidgetState();
}

class _RatingWidgetState extends State<RatingWidget> {
  bool hasBeenModified = false;
  bool isRatingDone = false;
  bool rewardClaimed = false;
  double currentRating = 0;

  void sendRating() {
    try {
      HttpUserData.updateRating(
              Provider.of<UserModel>(context, listen: false).email,
              currentRating.toInt())
          .then((value) {
        if (value.isNotEmpty) {
          PopupService.openErrorPopup(value, context);
          return;
        }
        setState(() {
          isRatingDone = true;
          Provider.of<UserModel>(context, listen: false).rating =
              currentRating.toInt();
        });
      });
    } catch (e) {
      PopupService.openErrorPopup(error_messages.unknownError, context);
      return;
    }
  }

  Widget getRatingWidget() {
    setState(() {
      isRatingDone = Provider.of<UserModel>(context, listen: false).rating >=
              MIN_RATING_VALUE &&
          Provider.of<UserModel>(context, listen: false).rating <=
              MAX_RATING_VALUE;
    });
    if (isRatingDone) return const Center();
    return Column(children: [
      RatingBar.builder(
        initialRating: 1,
        minRating: 1,
        direction: Axis.horizontal,
        allowHalfRating: false,
        itemCount: 5,
        itemPadding: const EdgeInsets.symmetric(horizontal: 4.0),
        itemBuilder: (context, _) => const Icon(
          Icons.star,
          color: Colors.amber,
        ),
        onRatingUpdate: (rating) {
          // Detect that the user has changed the rating
          setState(() {
            currentRating = rating;
          });
          setState(() {
            hasBeenModified = true;
          });
        },
      ),
      Center(child: getSendButton()),
    ]);
  }

  Widget getSendButton() {
    if (!hasBeenModified) return const Center();
    return TextButton(
        onPressed: () => sendRating(),
        child: Text(translate("rating.validate")));
  }

  void claimReward() {
    try {
      HttpUserData.claimRatingReward(
              Provider.of<UserModel>(context, listen: false).email)
          .then((value) {
        if (value.isNotEmpty) {
          PopupService.openErrorPopup(value, context);
          return;
        }

        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(translate("rating.coins_reward_message")),
          duration: const Duration(seconds: 3),
          action: SnackBarAction(
            label: translate('chat.DISMISS'),
            onPressed: () {
              ScaffoldMessenger.of(context).hideCurrentSnackBar();
            },
          ),
        ));
        setState(() {
          rewardClaimed = true;
          Provider.of<UserModel>(context, listen: false).coins +=
              RATING_COIN_REWARD;
          Provider.of<UserModel>(context, listen: false).receivedRatingReward =
              true;
        });
      });
    } catch (e) {
      PopupService.openErrorPopup(error_messages.unknownError, context);
      return;
    }
  }

  Widget getClaimRewardWidget() {
    setState(() {
      rewardClaimed =
          Provider.of<UserModel>(context, listen: false).receivedRatingReward;
    });
    if (isRatingDone && !rewardClaimed) {
      return Column(children: [
        Text(translate("rating.thanks")),
        TextButton(
            onPressed: () => {claimReward()},
            child: Text(translate("rating.obtain_reward")))
      ]);
    }
    return const Center();
  }

  Widget getCongratsText() {
    if (rewardClaimed && isRatingDone) {
      return Text(translate("rating.thanks"));
    }
    return Center();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        getRatingWidget(),
        getClaimRewardWidget(),
        // getCongratsText(),
      ],
    );
  }
}
