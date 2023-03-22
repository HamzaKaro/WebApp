import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:poly_scrabble/models/shop/cart.dart';
import 'package:provider/provider.dart';

class EmptyButton extends StatelessWidget {
  const EmptyButton({super.key});

  @override
  Widget build(BuildContext context) {
    var cart = context.watch<CartModel>();
    return SizedBox(
      width: 150.0,
      height: 45.0,
      child: ElevatedButton(
        style: ButtonStyle(
          backgroundColor: MaterialStateProperty.all(
              const Color.fromARGB(255, 62, 138, 170)),
        ),
        // todo: change content of onPressed
        onPressed: () {
          cart.removeAllItem();
        },
        child: Text(translate("shop.empty_button"),
            style: GoogleFonts.montserrat(
              color: const Color.fromARGB(255, 255, 251, 251),
              fontSize: 18,
              fontWeight: FontWeight.w500,
            )),
      ),
    );
  }
}
