import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:html/parser.dart' show parse;
import 'package:html_character_entities/html_character_entities.dart';
import 'package:poly_scrabble/services/http/http_search_definition.dart';
import 'package:poly_scrabble/services/popup_service.dart';

class DefinitionsByCategory {
  final String category;
  final List<String> definitions;

  DefinitionsByCategory({required this.category, required this.definitions});
}

class SearchDefinition extends StatefulWidget {
  const SearchDefinition({Key? key}) : super(key: key);

  @override
  State<SearchDefinition> createState() => _SearchDefinitionState();
}

class _SearchDefinitionState extends State<SearchDefinition> {
  late TextEditingController _searchInputController;
  late List<DefinitionsByCategory> definitionsToDisplay;
  late AnimationController animationController;
  bool isLoading = false;
  String errorMessage = '';

  @override
  void initState() {
    _searchInputController = TextEditingController();
    definitionsToDisplay = [];
    super.initState();
  }

  @override
  void dispose() {
    animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 550,
      // color: Colors.grey,
      child: Column(children: [
        // FloatingActionButton(
        //     onPressed: getDefinitions, child: const Icon(Icons.search)),
        TextFormField(
          onFieldSubmitted: (value) {
            getDefinitions();
            hideKeyboard();
          },
          controller: _searchInputController,
          decoration: InputDecoration(
              border: const OutlineInputBorder(),
              enabledBorder: OutlineInputBorder(
                borderSide: BorderSide(
                    width: 3,
                    color: Theme.of(context).focusColor), //<-- SEE HERE
              ),
              labelText: translate("search_definition.title"),
              hintText: translate("search_definition.hint_text"),
              prefixIcon: (_searchInputController.text.isNotEmpty)
                  ? IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () {
                        setState(() {
                          _searchInputController.clear();
                          definitionsToDisplay = [];
                          errorMessage = '';
                          isLoading = false;
                        });
                      })
                  : null,
              suffixIcon: IconButton(
                  icon: const Icon(Icons.search),
                  onPressed: () {
                    hideKeyboard();
                    getDefinitions();
                  })),
        ),
        getLoadingWidget(),
        getErrorMessageWidget(),
        Container(
          height: 30,
        ),
        // getDefinitionsContainer(),
      ]),
    );
  }

  Widget getDefinitionsContainer() {
    return Container(
      height: 200,
      child: displayDefinitions(),
    );
  }

  Widget getErrorMessageWidget() {
    if (errorMessage.isEmpty) return Center();
    return Container(
        width: double.infinity,
        decoration: (BoxDecoration(
          color: Colors.red[100],
          borderRadius: BorderRadius.circular(5),
        )),
        padding: const EdgeInsets.all(15),
        margin: const EdgeInsets.symmetric(vertical: 20, horizontal: 0),
        child: Text(errorMessage));
  }

  Widget getLoadingWidget() {
    if (!isLoading) return Center();
    return Container(
        padding: EdgeInsets.symmetric(vertical: 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(translate("search_definition.search_in_progress")),
            CircularProgressIndicator()
          ],
        ));
  }

  void hideKeyboard() {
    try {
      FocusManager.instance.primaryFocus?.unfocus();
    } catch (e) {
      log(e.toString());
    }
  }

  String generateApiError() {
    // return translate('search_definition.word_not_found_error');
    return translate('search_definition.word_not_found_error', args: {
      'word': _searchInputController.text,
    });
  }

  void getDefinitions() {
    setState(() {
      errorMessage = '';
      isLoading = true;
    });
    HttpSearchDefinition.getWordDefinition(_searchInputController.text)
        .then((value) {
      try {
        setState(() {
          isLoading = false;
        });
        if (value.error.isNotEmpty) {
          PopupService.openErrorPopup(value.error, context);
          return;
        } else if (value.search!.errorApi.isNotEmpty) {
          setState(() {
            errorMessage = generateApiError(); // value.search!.errorApi;
            definitionsToDisplay = [];
          });

          return;
        }
        setDefinitions(value.search);
        Widget widget = Container(
          height: 300,
          width: 480,
          // color: Colors.amberAccent,
          child: displayDefinitions(),
        );
        PopupService.openWordDefinitions(
            context, widget, _searchInputController.text);
      } catch (e) {
        PopupService.openErrorPopup(e.toString(), context);
      }
    });
  }

  setDefinitions(dynamic searchResponse) {
    try {
      List<DefinitionsByCategory> definitions = [];
      for (var i = 0; i < searchResponse.nature.length; i++) {
        List<String> defs = [];
        dynamic defObject = searchResponse.natureDef[i][0];
        defObject.forEach((k, v) => {defs.add('$k. $v')});
        DefinitionsByCategory def = DefinitionsByCategory(
            category: searchResponse.nature[i], definitions: defs);
        definitions.add(def);
      }
      setState(() {
        definitionsToDisplay = definitions;
      });
    } catch (error) {
      log(error.toString());
    }
  }

  // Return '' if no text between anchor tag was found
  String extractTextBetweenAnchorTag(String text) {
    var matches = parse(text).getElementsByTagName('a');
    if (matches.isEmpty) return '';
    return matches[matches.length - 1].innerHtml;
  }

  Widget displayDefinitions() {
    return RawScrollbar(
        thumbVisibility: true,
        child: SingleChildScrollView(
            // height: 50,
            child: Column(
          children: <Widget>[
            ListView.builder(
              shrinkWrap: true,
              physics: const ClampingScrollPhysics(),
              itemCount: definitionsToDisplay.length,
              itemBuilder: (context, index) {
                return Center(
                  child: createDefinitionsOfCategoryWidget(
                      definitionsToDisplay[index]),
                );
              },
            ),
          ],
        )));
  }

  void handleWordLinkClicked(String word) {
    _searchInputController.text = extractTextBetweenAnchorTag(word);
    getDefinitions();
  }

  Widget createDefinitionsOfCategoryWidget(
      DefinitionsByCategory definitionType) {
    return Column(
      children: <Widget>[
        Text(definitionType.category,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
        ListView.builder(
          shrinkWrap: true,
          physics: const ClampingScrollPhysics(),
          itemCount: definitionType.definitions.length,
          itemBuilder: (context, index) {
            return Container(
                padding: EdgeInsets.all(4.0),
                child: extractTextBetweenAnchorTag(
                            definitionType.definitions[index])
                        .isEmpty
                    ? Text(
                        HtmlCharacterEntities.decode(
                            definitionType.definitions[index]),
                      )
                    : Html(
                        data: definitionType.definitions[index],
                        onLinkTap: (url, _, __, ___) => {
                          handleWordLinkClicked(
                              definitionType.definitions[index])
                        },
                      ));
          },
        ),
      ],
    );
  }
}
