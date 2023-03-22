import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/constants/constants.dart';

class TutorialStepWidget extends StatefulWidget {
  final int stepNumber;
  const TutorialStepWidget({Key? key, required this.stepNumber})
      : super(key: key);

  @override
  State<TutorialStepWidget> createState() => _TutorialStepWidgetState();
}

class _TutorialStepWidgetState extends State<TutorialStepWidget> {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 300,
      width: 500,
      child: Column(
        children: [
          Text('${widget.stepNumber + 1} / ${TUTORIAL_STEPS.length}',
              style: const TextStyle(color: Colors.black)),
          Image.asset(
            TUTORIAL_STEPS.elementAt(widget.stepNumber).imageURL,
            height: 200,
          ),
          Text(
              translate(TUTORIAL_STEPS
                  .elementAt(widget.stepNumber)
                  .titleTranslationKey),
              style: const TextStyle(
                  fontWeight: FontWeight.bold, color: Colors.black)),
          Text(
              translate(TUTORIAL_STEPS
                  .elementAt(widget.stepNumber)
                  .descriptionTranslationKey),
              style: const TextStyle(color: Colors.black)),
        ],
      ),
    );
  }
}
