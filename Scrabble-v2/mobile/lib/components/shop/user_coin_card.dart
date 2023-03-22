import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:provider/provider.dart';

class UserCoinCard extends StatefulWidget {
  final int currentCoins;
  const UserCoinCard({Key? key, required this.currentCoins}) : super(key: key);

  @override
  State<UserCoinCard> createState() => _userCoinCardState();
}

class _userCoinCardState extends State<UserCoinCard> {
  var coins;

  @override
  void initState() {
    coins = widget.currentCoins;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
        decoration: BoxDecoration(
            color: const Color.fromARGB(248, 235, 236, 238),
            border: Border.all(
              color: const Color.fromARGB(248, 235, 236, 238),
            ),
            borderRadius: const BorderRadius.all(Radius.circular(20))),
        width: 340,
        height: 96,
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(
              width: 320,
              height: 40,
              padding: const EdgeInsets.all(5),
              decoration: BoxDecoration(
                  boxShadow: const <BoxShadow>[
                    BoxShadow(
                        color: Color.fromARGB(135, 109, 108, 108),
                        blurRadius: 5.0,
                        offset: Offset(0.0, 0.75))
                  ],
                  color: const Color.fromARGB(255, 255, 255, 255),
                  border: Border.all(
                    color: const Color.fromARGB(255, 0, 0, 0),
                  ),
                  borderRadius: const BorderRadius.all(Radius.circular(50))),
              child: Row(children: [
                Align(
                    child: Text(
                  translate("shop.current_token_user_msg"),
                  style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.black),
                )),
                const SizedBox(width: 170),
                SizedBox(
                  child:
                      Consumer<UserModel>(builder: (context, userModel, child) {
                    return Text(userModel.coins.toString(),
                        style: const TextStyle(color: Colors.black));
                  }),
                )
                // SubTitle2(currentCoins.toString()),
              ]))
        ]));
  }
}
