// Copyright 2019 The Flutter team. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import 'package:poly_scrabble/constants/shop_items.dart';

class CatalogModel {
  Item getById(int id) => Item(
      id: id,
      name: ITEMS_LIST[id].name,
      price: ITEMS_LIST[id].price,
      isAvailable: ITEMS_LIST[id].isAvailable);

  Item getByPosition(int position) {
    return getById(position);
  }
}

class Item {
  final int id;
  final String name;
  final int price;
  late bool isAvailable;

  Item({
    required this.id,
    required this.name,
    required this.price,
    required this.isAvailable,
  });

  factory Item.fromJson(Map<String, dynamic> json) {
    return Item(
      id: json['id'],
      name: json['name'],
      price: json['price'],
      isAvailable: json['isAvailable'],
    );
  }
}
