// Copyright 2019 The Flutter team. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:poly_scrabble/components/buttons/buy.dart';
import 'package:poly_scrabble/components/buttons/empty.dart';
import 'package:poly_scrabble/components/message.dart';
import 'package:poly_scrabble/components/shop/items_list.dart';
import 'package:poly_scrabble/components/shop/user_coin_card.dart';
import 'package:poly_scrabble/constants/shop_items.dart';
import 'package:poly_scrabble/models/shop/cart.dart';
import 'package:poly_scrabble/models/shop/catalog.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/screens/home_screen.dart';
import 'package:poly_scrabble/widgets/common/app_nav_bar_widget.dart';
import 'package:provider/provider.dart';

import '../../components/chat/chat_modal.dart';
import '../../components/chat/floating_chat_button.dart';

class MyCatalog extends StatefulWidget {
  static Route get route => MaterialPageRoute(
        builder: (context) => const MyCatalog(),
      );

  const MyCatalog({Key? key}) : super(key: key);

  @override
  State<MyCatalog> createState() => _myCatalogState();
}

class _myCatalogState extends State<MyCatalog> {
  int currentCoins = 0;
  List<Item> currentUserCart = [];
  var user;
  var cart;
  var soundService;

  @override
  void initState() {
    user = Provider.of<UserModel>(context, listen: false);
    cart = Provider.of<CartModel>(context, listen: false);
    currentUserCart = cart.items;
    currentCoins = user.coins;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    var cart = context.watch<CartModel>();
    return Scaffold(
      appBar: AppNavBar(
        title: 'Boutique en ligne',
        allowBack: true,
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
              child: Center(
            child: Form(
                child: Stack(fit: StackFit.loose, children: <Widget>[
              Column(
                children: [
                  Container(
                    alignment: Alignment.center,
                    child: SizedBox(
                        child: Column(children: [
                      const SizedBox(
                        height: 20,
                      ),
                      // TITLE PAGE
                      Align(
                          child: Text(
                        translate("shop.title_page"),
                        style: const TextStyle(
                            fontSize: 28, fontWeight: FontWeight.bold),
                      )),
                      const SizedBox(
                        height: 60,
                      ),
                      // CURRENT TOKEN OF CURRENT USER
                      UserCoinCard(currentCoins: currentCoins),
                      const SizedBox(
                        height: 60,
                      ),
                      // ITEMS LIST TO SELL
                      Align(
                          child: Text(
                        translate("shop.title_items_list"),
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      )),
                      const Padding(
                        padding: EdgeInsets.fromLTRB(260, 20, 260, 80),
                        child: ItemsList(),
                      ),
                    ])),
                  ),
                  // SHOPPING CART BASKET
                  Container(
                      decoration: BoxDecoration(
                        color: Color.fromARGB(255, 255, 255, 255),
                        border: Border.all(
                            color: const Color.fromARGB(255, 74, 62, 62),
                            width: 1),
                      ),
                      width: 600,
                      height: 390,
                      child: Column(
                        children: [
                          const SizedBox(height: 30),
                          Align(
                              child: Text(
                            translate("shop.title_shoppind_cart_list"),
                            style: const TextStyle(
                                fontSize: 20, fontWeight: FontWeight.bold),
                          )),
                          const SizedBox(height: 30),
                          SizedBox(
                            child: cart.items.isEmpty
                                ? SizedBox(
                                    child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: <Widget>[
                                        const SizedBox(height: 80),
                                        MessageNotification(
                                            text: translate(
                                                "shop.empty_cart_msg"),
                                            isError: true),
                                      ]))
                                : SingleChildScrollView(
                                    child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                        _CartList(),
                                      ])),
                          )
                        ],
                      )),
                  const SizedBox(
                    height: 90,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Align(
                          child: Text(
                        translate("shop.total_token_title"),
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      )),
                      const SizedBox(
                        width: 20,
                      ),
                      Text(
                        '${cart.totalPrice}',
                        style: const TextStyle(
                            fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(
                        width: 8,
                      ),
                      iconToken,
                    ],
                  ),
                  const SizedBox(
                    height: 90,
                  ),
                  // EMPTY SHOPPING CART BASKET AND BUY BUTTON
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const EmptyButton(),
                      const SizedBox(
                        width: 20,
                      ),
                      BuyButton(currentCoins: currentCoins),
                    ],
                  ),
                  const SizedBox(
                    height: 40,
                  ),
                  // // RETURN BUTTON
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      BackToHomePageButton(route: HomeScreen.route),
                    ],
                  ),
                  const SizedBox(
                    height: 40,
                  ),
                ],
              ),
            ])),
          )),
          const ChatModal(),
        ],
      ),
      floatingActionButton: const FloatingChatButton(),
    );
  }
}

class _CartList extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var cart = context.watch<CartModel>();

    return ListView.builder(
      shrinkWrap: true,
      itemCount: cart.items.length,
      itemBuilder: (context, index) => ListTile(
        trailing: IconButton(
          icon: iconRemove,
          onPressed: () {
            cart.remove(cart.items[index]);
            const SizedBox(
              width: 100,
            );
          },
        ),
        title: Row(children: [
          const SizedBox(
            width: 30,
          ),
          Text(
            cart.items[index].name,
            style: const TextStyle(
                color: Colors.black, fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(
            width: 40,
          ),
          Row(
            children: [
              Text(
                cart.items[index].price.toString(),
                style: const TextStyle(
                    color: Colors.black,
                    fontSize: 14,
                    fontWeight: FontWeight.bold),
              ),
              const SizedBox(
                width: 10,
              ),
              iconToken,
            ],
          )
        ]),
      ),
    );
  }
}

class BackToHomePageButton extends StatefulWidget {
  final Route<dynamic> route;
  const BackToHomePageButton({super.key, required this.route});

  @override
  State<BackToHomePageButton> createState() => _BackToHomePageButtonState();
}

class _BackToHomePageButtonState extends State<BackToHomePageButton> {
  @override
  Widget build(BuildContext context) {
    var cart = context.watch<CartModel>();
    return SizedBox(
      width: 320.0,
      height: 45.0,
      child: ElevatedButton(
        style: ButtonStyle(
          backgroundColor: MaterialStateProperty.all(const Color(0xFFecba8c)),
        ),
        onPressed: () {
          Navigator.of(context).push(HomeScreen.route);
          cart.removeAllItem();
        },
        child: Text(translate("shop.return_button"),
            style: GoogleFonts.montserrat(
              color: Colors.black,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            )),
      ),
    );
  }
}
