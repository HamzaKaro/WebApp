import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:poly_scrabble/components/chat/chat_components.dart';
import 'package:poly_scrabble/components/configuration/text_form.dart'
    as component_text;
import 'package:poly_scrabble/constants/error_messages.dart';
import 'package:poly_scrabble/constants/rating.dart';
import 'package:poly_scrabble/screens/admin_screen.dart';
import 'package:poly_scrabble/screens/blog/blog_list_screen.dart';
import 'package:poly_scrabble/screens/navigation/classic_games_nav_screen.dart';
import 'package:poly_scrabble/screens/shop/catalog.dart';
import 'package:poly_scrabble/services/auth_service.dart';
import 'package:poly_scrabble/services/http/http_user_data.dart';
import 'package:poly_scrabble/services/popup_service.dart';
import 'package:poly_scrabble/services/rooms_service.dart';
import 'package:poly_scrabble/services/socket_service.dart';
import 'package:poly_scrabble/services/sound_service.dart';
import 'package:poly_scrabble/widgets/invitation_popup_widget.dart';
import 'package:poly_scrabble/widgets/tutorial.dart';
import 'package:provider/provider.dart';

import '../models/user.dart';
import '../widgets/common/app_nav_bar_widget.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  static Route get route => MaterialPageRoute(
        builder: (context) => const HomeScreen(),
      );

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  double ratingAverage = 0;
  late UserPreferences userPreferences;
  var soundService;
  var userModel;

  @override
  void initState() {
    userModel = Provider.of<UserModel>(context, listen: false);
    Provider.of<SoundService>(context, listen: false).turnOn =
        userModel.preferences.soundAnimations;
    soundService =
        SoundService(Provider.of<SoundService>(context, listen: false).turnOn);
    Provider.of<SocketService>(context, listen: false).on(
        'invite-friend',
        (invitation) => {
              if (!Provider.of<RoomService>(context, listen: false).isInRoom)
                {
                  showDialog(
                    context: context,
                    builder: (BuildContext dialogContext) {
                      return InvitationPopup(
                          invitation:
                              Provider.of<RoomService>(context, listen: false)
                                  .convertInvitation(invitation));
                    },
                  )
                }
            });
    getRatingAverage();
    super.initState();
  }

  // enableSound(bool turnOn) {
  //   if (turnOn == true) {
  //     soundService = SoundService(turnOn);
  //   }
  // }
//   @override
//   void dispose() {
//     AuthService.logout(Provider.of<UserModel>(context, listen: false).email);
//     Provider.of<UserModel>(context, listen: false).reset();

//     print('DISPOSE HOME SCREEN');
//     super.dispose();
//   }

  @override
  Widget build(BuildContext context) {
    bool shouldPop = true;

    changeLocale(context,
        Provider.of<UserModel>(context, listen: true).preferences.language);
    return WillPopScope(
      onWillPop: () async {
        AuthService.logout(
            Provider.of<UserModel>(context, listen: false).username);
        Provider.of<UserModel>(context, listen: false).reset();
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(translate("auth.disconnection_success")),
          duration: const Duration(seconds: 5),
          action: SnackBarAction(
            label: translate('chat.DISMISS'),
            onPressed: () {
              ScaffoldMessenger.of(context).hideCurrentSnackBar();
            },
          ),
        ));
        return shouldPop;
      },
      child: Scaffold(
          appBar: AppNavBar(title: "PolyScrabble", allowBack: false),
          body: SizedBox(
            width: 3000,
            height: 4000,
            child: Stack(
              fit: StackFit.loose,
              children: <Widget>[
                Container(
                    alignment: Alignment.center,
                    child: SizedBox(child:
                        Consumer<UserModel>(builder: ((context, user, child) {
                      soundService =
                          SoundService(user.preferences.soundAnimations);
                      return Column(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // TITLE PAGE //
                          component_text.MainTitle(translate("homepage.title")),
                          // Insert options button list
                          Column(
                            children: [
                              ElevatedButton(
                                  onPressed: () {
                                    Navigator.of(context).push(
                                        ClassicGameNavigationScreen.route);
                                    soundService
                                        .controllerSound('Selection-options');
                                  },
                                  style: ElevatedButton.styleFrom(
                                      minimumSize: const Size(350, 40)),
                                  child: Text(
                                      translate(
                                          'homepage.classic_scrabble_button'),
                                      style: GoogleFonts.montserrat(
                                        color: Colors.white,
                                        fontSize: 18,
                                        fontWeight: FontWeight.w600,
                                      ))),
                              ElevatedButton(
                                  onPressed: () {
                                    Navigator.of(context).push(MyCatalog.route);

                                    soundService
                                        .controllerSound('Selection-options');
                                  },
                                  style: ElevatedButton.styleFrom(
                                      minimumSize: const Size(350, 40)),
                                  child: Text(
                                      translate('homepage.online_store_button'),
                                      style: GoogleFonts.montserrat(
                                        color: Colors.white,
                                        fontSize: 18,
                                        fontWeight: FontWeight.w600,
                                      ))),
                              ElevatedButton(
                                  onPressed: () {
                                    showDialog(
                                        context: context,
                                        builder: (context) =>
                                            const TutorialWidget());
                                    soundService
                                        .controllerSound('Selection-options');
                                  },
                                  style: ElevatedButton.styleFrom(
                                      minimumSize: const Size(350, 40)),
                                  child: Text(
                                      translate('homepage.tutorial_button'),
                                      style: GoogleFonts.montserrat(
                                        color: Colors.white,
                                        fontSize: 18,
                                        fontWeight: FontWeight.w600,
                                      ))),
                              ElevatedButton(
                                  onPressed: () {
                                    Navigator.of(context)
                                        .push(BlogListscreen.route);
                                    soundService
                                        .controllerSound('Selection-options');
                                  },
                                  style: ElevatedButton.styleFrom(
                                      minimumSize: const Size(350, 40)),
                                  child: Text(translate('blog.news'),
                                      style: GoogleFonts.montserrat(
                                        color: Colors.white,
                                        fontSize: 18,
                                        fontWeight: FontWeight.w600,
                                      ))),
                              if (user.isAdmin)
                                ElevatedButton(
                                    onPressed: () {
                                      Navigator.of(context)
                                          .push(BlogListscreen.route);
                                      soundService
                                          .controllerSound('Selection-options');
                                    },
                                    style: ElevatedButton.styleFrom(
                                        minimumSize: const Size(350, 40)),
                                    child: Text(translate('blog.news'),
                                        style: GoogleFonts.montserrat(
                                          color: Colors.white,
                                          fontSize: 18,
                                          fontWeight: FontWeight.w600,
                                        ))),
                              if (user.isAdmin)
                                ElevatedButton(
                                    onPressed: () {
                                      Navigator.of(context)
                                          .push(AdminScreen.route);
                                      soundService
                                          .controllerSound('Selection-options');
                                    },
                                    style: ElevatedButton.styleFrom(
                                        minimumSize: const Size(350, 40)),
                                    child: Text(translate('pages.admin'),
                                        style: GoogleFonts.montserrat(
                                          color: Colors.white,
                                          fontSize: 18,
                                          fontWeight: FontWeight.w600,
                                        )))
                            ],
                          ),
                          Center(
                            child: getAverageText(),
                          ),
                        ],
                      );
                    })))),
                const ChatModal(),
              ],
            ),
          ),
          floatingActionButton: const FloatingChatButton()),
    );
  }

  void getRatingAverage() {
    try {
      HttpUserData.getRatingsAverage().then((value) {
        if (!mounted) return;
        if (value.error.isNotEmpty) {
          PopupService.openErrorPopup(value.error, context);
        } else if (value.average > 0) {
          setState(() {
            ratingAverage = value.average;
          });
        } else {
          return;
        }
      });
    } catch (e) {
      PopupService.openErrorPopup(unknownError, context);
      return;
    }
  }

  Widget getAverageText() {
    if (ratingAverage <= 0) return const Center();
    return Center(
        child: Column(

            children: [

              Text(translate('rating.overall')),
              RatingBar.builder(
                initialRating: ratingAverage.round().toDouble(),
                minRating: 1,
                direction: Axis.horizontal,
                allowHalfRating: true,
                itemCount: 5,
                ignoreGestures: true,
                itemPadding: const EdgeInsets.symmetric(horizontal: 4.0),
                itemBuilder: (context, _) => const Icon(
                  Icons.star,
                  color: Colors.amber,
                ),
                onRatingUpdate: (rating) {
                },
              ),
              Text('$ratingAverage / $MAX_RATING_VALUE')]));
  }
}
