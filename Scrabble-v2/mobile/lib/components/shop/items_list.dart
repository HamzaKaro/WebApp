import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/constants/shop_items.dart';
import 'package:poly_scrabble/models/shop/cart.dart';
import 'package:poly_scrabble/models/shop/catalog.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:provider/provider.dart';

class ItemsList extends StatefulWidget {
  const ItemsList({super.key});

  @override
  State<ItemsList> createState() => _itemsListState();
}

class _itemsListState extends State<ItemsList> {
  var user;
  List<String> userThemes = [];

  @override
  void initState() {
    user = Provider.of<UserModel>(context, listen: false);
    userThemes = user.themes;
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 250,
      child: ListView.separated(
        itemCount: ITEMS_LIST.length,
        itemBuilder: (context, index) {
          return _MyListItem(index, userThemes);
        },
        padding: const EdgeInsets.all(10),
        separatorBuilder: (context, index) {
          return const SizedBox(width: 14);
        },
        scrollDirection: Axis.horizontal,
      ),
    );
  }
}

class _MyListItem extends StatefulWidget {
  final int index;
  final List<String> userThemes;

  const _MyListItem(this.index, this.userThemes);

  @override
  State<_MyListItem> createState() => __myListItemState();
}

class __myListItemState extends State<_MyListItem> {
  int currentCoins = 0;
  List<String> userThemes = [];
  List<Item> currentUserCart = [];
  var user;
  var index;
  var langue;

  @override
  void initState() {
    userThemes = widget.userThemes;
    index = widget.index;
    langue =
        Provider.of<UserModel>(context, listen: false).preferences.language;
    super.initState();
  }

  verifyUserThemes(Item item) {
    for (var i in userThemes) {
      if (i == item.name) {
        item.isAvailable = false;
      }
    }
    return item;
  }

  @override
  Widget build(BuildContext context) {
    var item = context.select<CatalogModel, Item>(
      (catalog) => catalog.getByPosition(index),
    );
    verifyUserThemes(item);
    return Container(
      decoration: BoxDecoration(
          boxShadow: const <BoxShadow>[
            BoxShadow(
                color: Color.fromARGB(136, 38, 35, 35),
                blurRadius: 5.0,
                offset: Offset(0.0, 0.75))
          ],
          color: !item.isAvailable
              ? Color.fromARGB(255, 177, 182, 189)
              : const Color.fromARGB(255, 244, 250, 255)),
      width: 130,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(
            height: 20,
          ),
          Text(
            ITEMS_LIST[index].name,
            style: const TextStyle(
                fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black),
          ),
          const SizedBox(
            height: 20,
          ),
          SizedBox(
            child: Image.asset(
              ICON_ITEMS_LIST[index],
              width: 70,
              height: 70,
            ),
          ),
          const SizedBox(
            height: 20,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: item.isAvailable == false
                ? <Widget>[]
                : <Widget>[
                    Text(
                      ITEMS_LIST[index].price.toString(),
                      style: const TextStyle(fontSize: 15, color: Colors.black),
                    ),
                    const SizedBox(width: 8),
                    iconToken,
                  ],
          ),
          _AddButton(item: verifyUserThemes(item), lang: langue),
        ],
      ),
    );
  }
}

class _AddButton extends StatelessWidget {
  final Item item;
  final String lang;
  const _AddButton({required this.item, required this.lang});

  Widget checkLanguage(String langChoosen) {
    if (langChoosen == "en") {
      return Text(translate("Add"));
    } else {
      return Text(translate("Ajouter"));
    }
  }

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: !item.isAvailable
          ? null
          : () {
              // If the item is not in cart, we let the user add it.
              // We are using context.read() here because the callback
              // is executed whenever the user taps the button. In other
              // words, it is executed outside the build method.
              var cart = context.read<CartModel>();
              cart.add(item);
            },
      style: ButtonStyle(
        overlayColor: MaterialStateProperty.resolveWith<Color?>((states) {
          if (states.contains(MaterialState.pressed)) {
            return Theme.of(context).primaryColor;
          }
          return null; // Defer to the widget's default.
        }),
      ),
      child: checkLanguage(lang),
    );
  }
}
