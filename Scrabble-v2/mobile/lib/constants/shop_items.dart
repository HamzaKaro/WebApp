import 'package:flutter/material.dart';
import 'package:poly_scrabble/models/item_shop.dart';
import 'package:poly_scrabble/services/material_colors_service.dart';

const DURATION_IN_SECONDS_SNACKBAR = 4;
const FACTOR_MILLISECONDS = 1000;
const CHEAP_PRICE_IN_COINS = 10;
const MIDDLE_PRICE_IN_COINS = 25;
const HIGH_PRICE_IN_COINS = 40;

// ITEMS LIST //
final List<ItemShop> ITEMS_LIST = [
  ItemShop(name: 'uni', price: CHEAP_PRICE_IN_COINS, isAvailable: true),
  ItemShop(name: 'fallGuys', price: MIDDLE_PRICE_IN_COINS, isAvailable: true),
  ItemShop(name: 'minecraft', price: HIGH_PRICE_IN_COINS, isAvailable: true),
  ItemShop(name: 'bubbleTea', price: HIGH_PRICE_IN_COINS, isAvailable: true),
  ItemShop(name: 'halloween', price: MIDDLE_PRICE_IN_COINS, isAvailable: true),
];

// ICON ITEMS LIST //
const List<String> ICON_ITEMS_LIST = [
  "assets/shop/Uni.jpg",
  "assets/shop/FallGuys.jpg",
  "assets/shop/Minecraft.jpg",
  "assets/shop/BubbleTea.jpg",
  "assets/shop/Halloween.jpg",
];

// ICON TOKEN PRICE //
Icon iconToken = Icon(
  Icons.generating_tokens,
  color: createMaterialColor(const Color.fromRGBO(224, 173, 33, 1)),
);

// ICON REMOVE //
Icon iconRemove = Icon(
  Icons.delete,
  color: createMaterialColor(Color.fromARGB(255, 36, 29, 9)),
);
