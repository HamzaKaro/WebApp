import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/services/utilities_service.dart';
import 'package:poly_scrabble/widgets/video_publicity.dart';

class PopupService {
  static var theContext;
  static void openErrorPopup(String errorDescription, context) {
    showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
              title: const Text("Attention !",
                  style: TextStyle(color: Colors.black)),
              content:
                  Text(errorDescription, style: TextStyle(color: Colors.black)),
              actions: <Widget>[
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(ctx).pop();
                  },
                  child: Container(
                    color: Colors.green,
                    child: Text(translate("actions.close")),
                  ),
                ),
              ],
            ));
  }

  static void hey(String errorDescription) {
    showDialog(
        context: theContext,
        builder: (ctx) => AlertDialog(
              title: Text(translate("end_game.title"),
                  style: TextStyle(color: Colors.black)),
              content: Column(
                children: [
                  Text(errorDescription, style: TextStyle(color: Colors.black)),
                  VideoPublicity()
                ],
              ),
              actions: <Widget>[
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(ctx).pop();
                  },
                  child: Container(
                    // color: Colors.green,
                    child: Text(translate('actions.close')),
                  ),
                ),
              ],
            ));
  }

  static openJokerPopup(context) {
    bool jokerValid = false;
    TextEditingController jokerController = TextEditingController();
    jokerController.text = '';
    return showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
              title: Text(translate("joker.title"),
                  style: TextStyle(color: Colors.black)),
              content: Container(
                  height: 125,
                  width: 250,
                  child: Column(
                    children: [
                      Text(translate("joker.info"),
                          style: TextStyle(color: Colors.black)),
                      TextFormField(
                        controller: jokerController,
                        autovalidateMode: AutovalidateMode.onUserInteraction,
                        validator: ((value) {
                          jokerValid = RegExp(
                                  r'^[a-zA-Z]$|^(À|à|Â|â|Ç|ç|É|é|È|è|Ê|ê|Ë|ë|Î|î|Ï|ï|Ô|ô|Ù|ù|Û|û|Ü|ü|Ÿ|ÿ)$')
                              .hasMatch(value!);
                          return jokerValid ? null : translate("joker.error");
                        }),
                        decoration: InputDecoration(
                            border: OutlineInputBorder(),
                            labelText: translate("joker.label"),
                            hintText: translate("joker.hint")),
                      ),
                    ],
                  )),
              actions: <Widget>[
                ElevatedButton(
                  onPressed: () {
                    if (!jokerValid) {
                      return;
                    }
                    Navigator.of(ctx).pop(
                        Utilities.removeDiacritics(jokerController.text)
                            .toLowerCase());
                  },
                  child: Text(translate("actions.close")),
                ),
              ],
            ));
  }

  static void openPublicityPopup(context) {
    showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
              title: Text(translate("publicity.publicity"),
                  style: TextStyle(color: Colors.black)),
              content: VideoPublicity(),
              actions: <Widget>[
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(ctx).pop();
                  },
                  child: Container(
                    child: Text(translate("actions.close")),
                  ),
                ),
              ],
            ));
  }

  static void openWordDefinitions(context, Widget definitions, String word) {
    showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
              title:
                  Text("${translate('search_definition.definitions')} '$word'"),
              content: Container(
                  height: 350,
                  width: 500,
                  child: Column(children: [
                    definitions,
                  ])),
              actions: <Widget>[
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(ctx).pop();
                  },
                  child: Container(
                    child: Text(translate("actions.close")),
                  ),
                ),
              ],
            ));
  }
}
