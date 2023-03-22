import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:poly_scrabble/constants/error_messages.dart';
import 'package:poly_scrabble/constants/shop_items.dart';
import 'package:poly_scrabble/models/shop/cart.dart';
import 'package:poly_scrabble/models/shop/catalog.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/services/http/http_user_data.dart';
import 'package:poly_scrabble/services/popup_service.dart';
import 'package:provider/provider.dart';

class BuyButton extends StatefulWidget {
  late int currentCoins;

  BuyButton({super.key, required this.currentCoins});

  @override
  State<BuyButton> createState() => _buyButtonState();
}

class _buyButtonState extends State<BuyButton> {
  var userCoins;
  late bool isTransactionDone;
  var cart;

  @override
  void initState() {
    userCoins = widget.currentCoins;
    isTransactionDone = false;
    cart = Provider.of<CartModel>(context, listen: false);
    super.initState();
  }

  List<String> getThemeNames(List<Item> items) {
    List<String> result = [];
    items.forEach((element) {
      result.add(element.name);
    });
    return result;
  }

  makeTransaction(int totalPrice) async {
    if (userCoins >= totalPrice) {
      try {
        await HttpUserData.addTheme(
            Provider.of<UserModel>(context, listen: false).email,
            getThemeNames(
                Provider.of<CartModel>(context, listen: false).items));
        await HttpUserData.addCoins(
                Provider.of<UserModel>(context, listen: false).email,
                -totalPrice)
            .then((value) {
          setState(() {
            isTransactionDone = true;
            Provider.of<UserModel>(context, listen: false)
                .removeCoins(totalPrice);
            Provider.of<UserModel>(context, listen: false).setThemes(
                Provider.of<CartModel>(context, listen: false).items);
            Provider.of<CartModel>(context, listen: false)
                .items
                .forEach((element) => {element.isAvailable = false});
            cart.removeAllItem();
          });
        });
      } catch (e) {
        PopupService.openErrorPopup(unknownError, context);
        return;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    var cart = context.watch<CartModel>();
    return SizedBox(
      width: 150.0,
      height: 45.0,
      child: ElevatedButton(
        style: ButtonStyle(
          backgroundColor:
              MaterialStateProperty.all(const Color.fromARGB(255, 42, 155, 38)),
        ),
        onPressed: () {
          makeTransaction(cart.totalPrice);
          if (userCoins < cart.totalPrice) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: Text(translate("shop.not_enough_token_user_msg")),
              action: SnackBarAction(label: 'X', onPressed: () {}),
              duration: const Duration(
                  seconds: DURATION_IN_SECONDS_SNACKBAR,
                  milliseconds: FACTOR_MILLISECONDS),
            ));
          }
        },
        child: Text(translate("shop.buy_button"),
            style: GoogleFonts.montserrat(
              color: const Color.fromARGB(255, 255, 255, 255),
              fontSize: 18,
              fontWeight: FontWeight.w500,
            )),
      ),
    );
  }
}
