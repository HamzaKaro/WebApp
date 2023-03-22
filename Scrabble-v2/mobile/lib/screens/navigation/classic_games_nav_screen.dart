import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:poly_scrabble/components/chat/chat_components.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/screens/configuration%20game/classic_game_config_screen.dart';
import 'package:poly_scrabble/screens/home_screen.dart';
import 'package:poly_scrabble/screens/join_room_screen.dart';
import 'package:poly_scrabble/services/material_colors_service.dart';
import 'package:poly_scrabble/services/sound_service.dart';
import 'package:poly_scrabble/widgets/common/app_nav_bar_widget.dart';
import 'package:provider/provider.dart';

class ClassicGameNavigationScreen extends StatefulWidget {
  const ClassicGameNavigationScreen({super.key});
  static Route get route => MaterialPageRoute(
        builder: (context) => const ClassicGameNavigationScreen(),
      );
  @override
  State<ClassicGameNavigationScreen> createState() =>
      _ClassicGameNavigationState();
}

class _ClassicGameNavigationState extends State<ClassicGameNavigationScreen> {
  var soundService;
  var userModel;

  @override
  void initState() {
    userModel = Provider.of<UserModel>(context, listen: false);
    Provider.of<SoundService>(context, listen: false).turnOn =
        userModel.preferences.soundAnimations;
    soundService =
        SoundService(Provider.of<SoundService>(context, listen: false).turnOn);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppNavBar(
          title: translate('homepage.creation_scrabble_classic'),
          allowBack: true,
        ),
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
                        Align(
                            child: Text(
                          translate("homepage.creation_scrabble_classic"),
                          style: const TextStyle(
                              fontSize: 40, fontWeight: FontWeight.bold),
                        )),

                        // Insert options button list t
                        Column(
                          children: [
                            ElevatedButton(
                                onPressed: () {
                                  Navigator.of(context).push(
                                      ClassicGameConfigurationScreen.route);
                                  soundService
                                      .controllerSound('Selection-options');
                                },
                                style: ElevatedButton.styleFrom(
                                    minimumSize: const Size(350, 40)),
                                child: Text(
                                    translate(
                                        'homepage.creation_scrabble_classic_button'),
                                    style: GoogleFonts.montserrat(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w600,
                                    ))),
                            ElevatedButton(
                                onPressed: () {
                                  Navigator.of(context)
                                      .push(JoinRoomScreen.route);
                                  soundService
                                      .controllerSound('Selection-options');
                                },
                                style: ElevatedButton.styleFrom(
                                    minimumSize: const Size(350, 40)),
                                child: Text(
                                    translate(
                                        'homepage.join_multiplayer_game_button'),
                                    style: GoogleFonts.montserrat(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w600,
                                    ))),
                            ElevatedButton(
                                onPressed: () {
                                  Navigator.of(context).push(HomeScreen.route);
                                  soundService
                                      .controllerSound('Selection-options');
                                },
                                style: ElevatedButton.styleFrom(
                                    minimumSize: const Size(350, 40),
                                    backgroundColor: createMaterialColor(
                                        const Color.fromRGBO(
                                            236, 186, 140, 1))),
                                child: Text(translate('homepage.return_button'),
                                    style: GoogleFonts.montserrat(
                                      color: Colors.black,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w600,
                                    ))),
                          ],
                        ),
                      ],
                    );
                  })))),
              const ChatModal()
            ],
          ),
        ),
        floatingActionButton: const FloatingChatButton());
  }
}
