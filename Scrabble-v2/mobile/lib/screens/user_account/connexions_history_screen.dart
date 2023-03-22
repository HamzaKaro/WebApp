import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:provider/provider.dart';

import '../../models/user.dart';

class ConnexionsHistoryScreen extends StatefulWidget {
  const ConnexionsHistoryScreen({super.key});

  static Route get route => MaterialPageRoute(
        builder: (context) => const ConnexionsHistoryScreen(),
      );

  @override
  State<ConnexionsHistoryScreen> createState() =>
      _ConnexionsHistoryScreenState();
}

class _ConnexionsHistoryScreenState extends State<ConnexionsHistoryScreen> {
  List<String> connexions = [];
  List<String> deconnexions = [];

  @override
  Widget build(BuildContext context) {
    setState(() {
      connexions = Provider.of<UserModel>(context, listen: false).connexions;
      deconnexions =
          Provider.of<UserModel>(context, listen: false).deconnexions;
    });
    return Container(
        // width: 500,
        // color: Colors.amber,
        child: Column(
      children: [
        Card(
            shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.all(Radius.circular(12))),
            child: Column(children: [
              Text(
                translate("connexions_page.connexions_summary"),
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
              ),
              Container(
                height: 80,
                child: getConnexionsWidget(),
              )
            ])),
        getDeconnexionsCard(),
      ],
    ));
  }

  Widget getDeconnexionsCard() {
    if (deconnexions.isEmpty) return Center();
    return Card(
        shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(12))),
        child: Column(children: [
          Text(
            translate("connexions_page.deconnexions_summary"),
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
          ),
          Container(
            height: 80,
            child: getDeconnexionsWidget(),
          )
        ]));
  }

  Widget getDeconnexionsWidget() {
    return RawScrollbar(
        thumbVisibility: true,
        child: SingleChildScrollView(
            child: Container(
                // height: 100,
                // color: Colors.blue,
                child: Center(
          child: ListView.builder(
            shrinkWrap: true,
            physics: const ClampingScrollPhysics(),
            itemCount: deconnexions.length,
            itemBuilder: (context, index) {
              return Center(
                  child: Container(
                      padding: EdgeInsets.all(4.0),
                      child: Text(
                        deconnexions[deconnexions.length - index - 1],
                      )));
            },
          ),
        ))));
  }

  Widget getConnexionsWidget() {
    return RawScrollbar(
        thumbVisibility: true,
        child: SingleChildScrollView(
            child: Container(
                // height: 100,
                // color: Colors.blue,
                child: Center(
          child: ListView.builder(
            shrinkWrap: true,
            physics: const ClampingScrollPhysics(),
            itemCount: connexions.length,
            itemBuilder: (context, index) {
              return Center(
                  child: Container(
                      padding: EdgeInsets.all(4.0),
                      child: Text(
                        connexions[connexions.length - index - 1],
                      )));
            },
          ),
        ))));
  }
}
