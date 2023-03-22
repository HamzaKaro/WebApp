import 'dart:developer';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/services/http/http_user_data.dart';
import 'package:poly_scrabble/services/popup_service.dart';
import 'package:poly_scrabble/services/sound_service.dart';
import 'package:provider/provider.dart';
import 'package:settings_ui/settings_ui.dart';

class SettingsPage extends StatefulWidget {
  SettingsPage({Key? key}) : super(key: key);
  final String title = "Settings";
  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool isSwitched = false;
  String dropdownvalue = "light";

  var themes = [
    'light',
    'dark',
  ];

  @override
  initState() {
    var otherThemes = Provider.of<UserModel>(context, listen: false).themes;
    themes.addAll(otherThemes);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
            title: Text(widget.title),
            actions: [
              ElevatedButton(
                  child: Text(translate("actions.save")),
                  onPressed: () {
                    try {
                      logPreferences();
                      Navigator.pop(context);
                      saveSettings();
                    } catch (exception, stack) {
                      log("Stack: ${stack.toString()}");
                      log("Exception ${exception.toString()}");
                    }
                  }),
            ],
            automaticallyImplyLeading: false),
        body: Container(
          child: SettingsList(
            lightTheme: SettingsThemeData(
                settingsListBackground:
                    Theme.of(context).scaffoldBackgroundColor),
            sections: [
              SettingsSection(
                margin: EdgeInsetsDirectional.zero,
                tiles: [
                  SettingsTile(
                    title: Text(translate("generic.language"),
                        style: TextStyle(color: Theme.of(context).splashColor)),
                    description: Text(
                        displayLanguage(
                          Provider.of<UserModel>(context, listen: false)
                              .preferences
                              .language,
                        ),
                        style: TextStyle(color: Theme.of(context).splashColor)),
                    leading: Icon(
                      Icons.language,
                      color: Theme.of(context).splashColor,
                    ),
                    onPressed: (BuildContext context) {
                      switchLanguage();
                    },
                  ),
                  SettingsTile(
                    title: Text('Theme',
                        style: TextStyle(color: Theme.of(context).splashColor)),
                    leading: Icon(Icons.phone_android,
                        color: Theme.of(context).splashColor),
                    value: DropdownButton(
                      focusColor: Theme.of(context).splashColor,
                      // Initial Value
                      value: Provider.of<UserModel>(context, listen: false)
                          .preferences
                          .theme,

                      // Down Arrow Icon
                      icon: const Icon(Icons.keyboard_arrow_down),
                      // Array list of items
                      items: themes.map((String items) {
                        return DropdownMenuItem(
                          value: items,
                          child: Text(items),
                        );
                      }).toList(),
                      // After selecting the desired option,it will
                      // change button value to selected value
                      onChanged: (String? newValue) {
                        if (newValue != null) {
                          // Provider.of<DarkThemeProvider>(context, listen: false)
                          //     .switchThemeMode(newValue);
                          Provider.of<UserModel>(context, listen: false)
                              .setTheme(newValue);
                        }
                        setState(() {
                          dropdownvalue = newValue!;
                          Provider.of<UserModel>(context, listen: false)
                              .setTheme(newValue);
                        });
                      },
                    ),
                    onPressed: (BuildContext context) {},
                  ),
                  SettingsTile(
                    title: Text(
                      'Effets sonores',
                      style: TextStyle(color: Theme.of(context).splashColor),
                    ),
                    leading: Icon(Icons.volume_down,
                        color: Theme.of(context).splashColor),
                    value: CupertinoSwitch(
                      // overrides the default green color of the track
                      activeColor: Colors.pink.shade200,
                      // color of the round icon, which moves from right to left
                      thumbColor: Colors.green.shade900,
                      // when the switch is off
                      trackColor: Colors.black12,
                      // boolean variable value
                      value: Provider.of<UserModel>(context, listen: false)
                          .preferences
                          .soundAnimations,
                      // changes the state of the switch
                      onChanged: (value) =>
                          setState(() => switchSoundEffect(value)),
                    ),
                    onPressed: (BuildContext context) {},
                  ),
                  SettingsTile(
                    title: Text('Effets Visuel',
                        style: TextStyle(color: Theme.of(context).splashColor)),
                    leading: Icon(Icons.animation,
                        color: Theme.of(context).splashColor),
                    value: CupertinoSwitch(
                      // overrides the default green color of the track
                      activeColor: Colors.pink.shade200,
                      // color of the round icon, which moves from right to left
                      thumbColor: Colors.green.shade900,
                      // when the switch is off
                      trackColor: Colors.black12,
                      // boolean variable value
                      value: Provider.of<UserModel>(context, listen: false)
                          .preferences
                          .visualAnimations,
                      // changes the state of the switch
                      onChanged: (value) => setState(() =>
                          Provider.of<UserModel>(context, listen: false)
                              .preferences
                              .visualAnimations = value),
                    ),
                    onPressed: (BuildContext context) {},
                  ),
                ],
              ),
            ],
          ),
        ));
  }

  switchSoundEffect(bool value) {
    Provider.of<UserModel>(context, listen: false).preferences.soundAnimations =
        value;
    Provider.of<SoundService>(context, listen: false).turnOn = value;
  }

  switchLanguage() {
    var langue =
        Provider.of<UserModel>(context, listen: false).preferences.language;
    if (langue == "en") {
      Provider.of<UserModel>(context, listen: false).setLangue("fr");
      changeLocale(context, "fr");
      print(getCurrentLocale());
      setState(() {});
    } else {
      Provider.of<UserModel>(context, listen: false).setLangue("en");
      changeLocale(context, "en");
      print(getCurrentLocale());
      setState(() {});
    }
  }

  saveSettings() {
    try {
      HttpUserData.updateSettings(
              Provider.of<UserModel>(context, listen: false).email,
              Provider.of<UserModel>(context, listen: false).preferences)
          .then((value) {
        if (value.isNotEmpty) {
          PopupService.openErrorPopup(value, context);
          return;
        }
      });
    } catch (e) {
      PopupService.openErrorPopup(e.toString(), context);
      return;
    }
  }

  displayLanguage(String language) {
    if (language == "en") return translate("generic.english");
    if (language == "fr") return translate("generic.french");
  }

  void logPreferences() {
    print(getCurrentLocale());
    log("Preferences");
    log("Langue: " +
        Provider.of<UserModel>(context, listen: false).preferences.language);
    log("Theme: " +
        Provider.of<UserModel>(context, listen: false).preferences.theme);
  }
}
