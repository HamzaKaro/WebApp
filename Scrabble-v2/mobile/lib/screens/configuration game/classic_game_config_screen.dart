import 'dart:convert';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:number_inc_dec/number_inc_dec.dart';
import 'package:poly_scrabble/components/chat/chat_components.dart';
import 'package:poly_scrabble/components/configuration/description_field_form.dart'
    as component_field_form;
import 'package:poly_scrabble/components/configuration/text_form.dart'
    as component_text;
import 'package:poly_scrabble/constants/config_items.dart';
import 'package:poly_scrabble/models/room.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/screens/navigation/classic_games_nav_screen.dart';
import 'package:poly_scrabble/screens/waiting_room_screen.dart';
import 'package:poly_scrabble/services/material_colors_service.dart';
import 'package:poly_scrabble/services/rooms_service.dart';
import 'package:poly_scrabble/services/sound_service.dart';
import 'package:provider/provider.dart';

class ClassicGameConfigurationScreen extends StatefulWidget {
  const ClassicGameConfigurationScreen({super.key});
  static Route get route => MaterialPageRoute(
        builder: (context) => const ClassicGameConfigurationScreen(),
      );
  @override
  State<ClassicGameConfigurationScreen> createState() =>
      _ClassicGameConfigurationState();
}

class _ClassicGameConfigurationState
    extends State<ClassicGameConfigurationScreen> {
  // Create an roomInfo instance
  Room futurRoom = Room();
  RoomInfo futurRoomInfo = RoomInfo();

  final List<bool> _selectedModeGame = <bool>[true, false];
  bool vertical = false;
  bool isNotPublic = true;

  TextEditingController inputLevelGameChosen =
      TextEditingController(text: 'easyLevel');
  TextEditingController inputTimerPerTurnChosen = TextEditingController();
  TextEditingController inputNumberPlayersChosen = TextEditingController();
  TextEditingController inputPassword = TextEditingController();
  List dictionaryWords = [];

  static List<Widget> modeGame = <Widget>[
    Text(translate("config_game.public_mode_label")),
    Text(translate("config_game.private_mode_label")),
  ];
  var soundService;
  var userModel;

  void setPassword() {
    futurRoomInfo.pw = inputPassword.text;
  }

  @override
  void initState() {
    inputLevelGameChosen;
    inputTimerPerTurnChosen;
    inputNumberPlayersChosen;
    futurRoomInfo.isPublic = true;
    futurRoomInfo.timerPerTurn = '60';
    futurRoomInfo.maxPlayers = 2;
    futurRoomInfo.pw = '';
    futurRoomInfo.levelGame = 'easyLevel';
    futurRoomInfo.dictionary = pathDefaultDictionary;
    futurRoomInfo.name = '';
    futurRoomInfo.isGameOver = false;
    futurRoomInfo.nbHumans = 2;
    futurRoomInfo.gameType = 'classic';
    futurRoom.currentPlayerPseudo = 'incognito';
    userModel = Provider.of<UserModel>(context, listen: false);
    Provider.of<SoundService>(context, listen: false).turnOn =
        userModel.preferences.soundAnimations;
    soundService =
        SoundService(Provider.of<SoundService>(context, listen: false).turnOn);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        log('Leaving Classic Game Config screen');
        Navigator.pop(context);
        return true;
      },
      child: Scaffold(
          appBar:
              AppBar(title: Text(translate('homepage.configuration_of_game'))),
          body: Stack(
            fit: StackFit.loose,
            children: <Widget>[
              Align(
                  alignment: Alignment.center,
                  child: Container(
                      width: 500,
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
                              translate("config_game.title"),
                              style: const TextStyle(
                                  fontSize: 28, fontWeight: FontWeight.bold),
                            )),
                            Align(
                                child: Text(
                              translate("config_game.sub_title"),
                              style: const TextStyle(
                                  fontSize: 20, fontWeight: FontWeight.bold),
                            )),
                            Column(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                const SizedBox(
                                  height: 40,
                                ),
                                // USER USERNAME //
                                Row(
                                  children: <Widget>[
                                    const component_field_form.IconForm(
                                        iconPseudo),
                                    Expanded(
                                        flex: 16,
                                        child: Text(
                                            translate(
                                                "config_game.pseudo_label"),
                                            style:
                                                const TextStyle(fontSize: 15))),
                                    SizedBox(child: Consumer<UserModel>(
                                        builder: ((context, user, child) {
                                      return component_text.SubTitle2(
                                          user.username);
                                    }))),
                                  ],
                                ),
                                const SizedBox(
                                  height: 30,
                                ),
                                // TIME PER TOUR //
                                Row(
                                  children: <Widget>[
                                    const Expanded(
                                        flex: 2, child: Icon(iconTimer)),
                                    Expanded(
                                      flex: 12,
                                      child: Align(
                                          alignment: Alignment.centerLeft,
                                          child: Text(
                                            translate("config_game.time_label"),
                                            style:
                                                const TextStyle(fontSize: 15),
                                          )),
                                    ),
                                    Expanded(
                                      flex: 4,
                                      child: NumberInputPrefabbed
                                          .roundedEdgeButtons(
                                        controller: inputTimerPerTurnChosen,
                                        min: 30,
                                        max: 300,
                                        incDecFactor: 30,
                                        initialValue: 60,
                                        onIncrement: (value) => setState(() =>
                                            futurRoomInfo.timerPerTurn =
                                                inputTimerPerTurnChosen.text),
                                        onDecrement: (value) => setState(() =>
                                            futurRoomInfo.timerPerTurn =
                                                inputTimerPerTurnChosen.text),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(
                                  height: 30,
                                ),
                                // NUMBER OF HUMAN PLAYERS//
                                Row(
                                  children: <Widget>[
                                    const Expanded(
                                        flex: 2,
                                        child: Icon(IconData(0xe61f,
                                            fontFamily: 'MaterialIcons'))),
                                    Expanded(
                                      flex: 12,
                                      child: Align(
                                          alignment: Alignment.centerLeft,
                                          child: Text(
                                            translate(
                                                "config_game.human_player_nb_label"),
                                            style:
                                                const TextStyle(fontSize: 15),
                                          )),
                                    ),
                                    Expanded(
                                      flex: 4,
                                      child: NumberInputPrefabbed
                                          .roundedEdgeButtons(
                                        controller: inputNumberPlayersChosen,
                                        min: 2,
                                        max: 4,
                                        incDecFactor: 1,
                                        initialValue: 2,
                                        onIncrement: (value) => setState(() =>
                                            futurRoomInfo.nbHumans = int.parse(
                                                inputNumberPlayersChosen.text)),
                                        onDecrement: (value) => setState(() =>
                                            futurRoomInfo.nbHumans = int.parse(
                                                inputNumberPlayersChosen.text)),
                                      ),
                                    )
                                  ],
                                ),
                              ],
                            ),
                            // VISIBILITY GAME//
                            SizedBox(
                              width: 20.0,
                              child: Row(
                                children: <Widget>[
                                  const Expanded(
                                      flex: 1, child: Icon(iconPrivacyGame)),
                                  Expanded(
                                    flex: 5,
                                    child: Align(
                                        alignment: Alignment.centerLeft,
                                        child: Text(
                                          translate(
                                              "config_game.visibility_mode_label"),
                                          style: const TextStyle(fontSize: 15),
                                        )),
                                  ),
                                  Expanded(
                                    flex: 4,
                                    child: ToggleButtons(
                                      direction: vertical
                                          ? Axis.vertical
                                          : Axis.horizontal,
                                      onPressed: (int index) {
                                        setState(() {
                                          // The button that is tapped is set to true, and the others to false.
                                          for (int i = 0;
                                              i < _selectedModeGame.length;
                                              i++) {
                                            _selectedModeGame[i] = i == index;
                                            if (index == 0) {
                                              futurRoomInfo.isPublic = true;
                                            } else {
                                              futurRoomInfo.isPublic = false;
                                            }
                                          }
                                        });
                                        soundService.controllerSound(
                                            'Selection-options');
                                      },
                                      borderRadius: const BorderRadius.all(
                                          Radius.circular(8)),
                                      selectedBorderColor: Colors.red[700],
                                      selectedColor: Theme.of(context)
                                          .textSelectionTheme
                                          .selectionColor,
                                      fillColor: Colors.red[200],
                                      color: Theme.of(context)
                                          .textSelectionTheme
                                          .selectionColor,
                                      constraints: const BoxConstraints(
                                        minHeight: 60.0,
                                        minWidth: 90.0,
                                      ),
                                      isSelected: _selectedModeGame,
                                      children: modeGame,
                                    ),
                                  )
                                ],
                              ),
                            ),
                            const SizedBox(
                              height: 30,
                            ),
                            if (futurRoomInfo.isPublic)
                              SizedBox(
                                  child: Row(
                                children: <Widget>[
                                  Expanded(
                                      flex: 4,
                                      child: Text(
                                          translate(
                                              "config_game.password_label"),
                                          style:
                                              const TextStyle(fontSize: 15))),
                                  Expanded(
                                      flex: 4,
                                      child: TextField(
                                          controller: inputPassword,
                                          decoration: InputDecoration(
                                            border: const OutlineInputBorder(),
                                            fillColor: Theme.of(context)
                                                .textSelectionTheme
                                                .selectionColor,
                                            labelText: translate(
                                                "config_game.optional_password_msg"),
                                          ))),
                                ],
                              )),
                            const SizedBox(
                              height: 30,
                            ),
                            Column(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Align(
                                    child: Text(
                                  translate("config_game.dictionary_label"),
                                  style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold),
                                )),
                                RadioListTile(
                                    title: Text(
                                      translate(
                                          "config_game.dictionary_radiotile"),
                                    ),
                                    value: pathDefaultDictionary,
                                    groupValue: futurRoomInfo.dictionary,
                                    onChanged: (value) {
                                      setState(() {
                                        futurRoomInfo.dictionary =
                                            value.toString();
                                        readJson(value.toString());
                                      });
                                    }),
                              ],
                            ),
                            // BUTTONS RETURN AND CREATE GAME//
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                ElevatedButton(
                                    onPressed: () {
                                      Navigator.of(context).push(
                                          ClassicGameNavigationScreen.route);
                                      soundService
                                          .controllerSound('Selection-options');
                                    },
                                    style: ElevatedButton.styleFrom(
                                        minimumSize: const Size(100, 40),
                                        backgroundColor: createMaterialColor(
                                            const Color.fromRGBO(
                                                236, 186, 140, 1))),
                                    child: Text(
                                        translate('config_game.return_button'),
                                        style: GoogleFonts.montserrat(
                                          color: Colors.black,
                                          fontSize: 18,
                                          fontWeight: FontWeight.w600,
                                        ))),
                                ElevatedButton(
                                    onPressed: () {
                                      futurRoom.currentPlayerPseudo =
                                          user.username;
                                      futurRoom.roomInfo = futurRoomInfo;
                                      if (futurRoomInfo.isPublic) {
                                        futurRoomInfo.pw = inputPassword.text;
                                      }
                                      Provider.of<RoomService>(context,
                                              listen: false)
                                          .createRoomInfo(futurRoom);
                                      Provider.of<RoomService>(context,
                                              listen: false)
                                          .sendRoomToServer(futurRoom);
                                      Navigator.of(context)
                                          .push(WaitingRoomScreen.route);
                                      soundService
                                          .controllerSound('Selection-options');
                                    },
                                    style: ElevatedButton.styleFrom(
                                        minimumSize: const Size(100, 40),
                                        backgroundColor: createMaterialColor(
                                            Color.fromARGB(255, 46, 167, 30))),
                                    child: Text(
                                        translate(
                                            'config_game.create_game_button'),
                                        style: GoogleFonts.montserrat(
                                          color:
                                              Color.fromARGB(255, 10, 10, 10),
                                          fontSize: 18,
                                          fontWeight: FontWeight.w600,
                                        ))),
                              ],
                            ),
                          ],
                        );
                      }))))),
              const ChatModal(),
            ],
          ),
          floatingActionButton: const FloatingChatButton()),
    );
  }

  Future<void> readJson(String pathJsonFile) async {
    final String response = await rootBundle.loadString(pathJsonFile);
    final data = await json.decode(response);
    setState(() {
      dictionaryWords = data["words"];
    });
  }
}
