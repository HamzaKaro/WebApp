import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/constants/constants.dart';
import 'package:poly_scrabble/services/sound_service.dart';
import 'package:poly_scrabble/widgets/tutorialStep.dart';
import 'package:provider/provider.dart';

class TutorialWidget extends StatefulWidget {
  const TutorialWidget({Key? key}) : super(key: key);
  @override
  State<TutorialWidget> createState() => _TutorialWidgetState();
}

class _TutorialWidgetState extends State<TutorialWidget> {
  int stepIndex = 0;

  @override
  Widget build(BuildContext context) {
    SoundService soundService =
        Provider.of<SoundService>(context, listen: false);
    return AlertDialog(
      title: Text(translate('tutorial.title'),
          style: const TextStyle(color: Colors.black)),
      content: TutorialStepWidget(stepNumber: stepIndex),
      actions: [
        if (stepIndex > 0)
          ElevatedButton(
              child: Text(
                  translate(
                    'tutorial.previous',
                  ),
                  style: const TextStyle(color: Colors.black)),
              onPressed: () {
                soundService.controllerSound('Selection-options');
                setState(() {
                  stepIndex--;
                });
              }),
        if (stepIndex >= TUTORIAL_STEPS.length - 1)
          ElevatedButton(
              child: Text(translate('tutorial.finish'),
                  style: const TextStyle(color: Colors.black)),
              onPressed: () => {
                    soundService.controllerSound('Selection-options'),
                    Navigator.pop(context)
                  })
        else
          ElevatedButton(
              child: Text(translate('tutorial.next'),
                  style: const TextStyle(color: Colors.black)),
              onPressed: () {
                soundService.controllerSound('Selection-options');
                setState(() {
                  stepIndex++;
                });
              }),
      ],
    );
  }
}
