// Copyright 2019 The Flutter team. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import 'package:flutter/foundation.dart';
import 'package:poly_scrabble/models/shop/catalog.dart';

class CartModel extends ChangeNotifier {
  late CatalogModel _catalog;
  final List<int> _itemIds = [];

  CatalogModel get catalog => _catalog;

  set catalog(CatalogModel newCatalog) {
    _catalog = newCatalog;
    notifyListeners();
  }

  List<Item> get items => _itemIds.map((id) => _catalog.getById(id)).toList();

  int get totalPrice =>
      items.fold(0, (total, current) => total + current.price);

  void add(Item item) {
    final foundItemId = _itemIds.contains(item.id);
    if (!foundItemId) {
      _itemIds.add(item.id);
      changeAvailableStatus(item);
    }
    notifyListeners();
  }

  changeAvailableStatus(Item item) {
    item.isAvailable = false;
    notifyListeners();
  }

  void remove(Item item) {
    _itemIds.remove(item.id);
    notifyListeners();
  }

  void removeAllItem() {
    _itemIds.clear();
    notifyListeners();
  }

  makeTransaction(int currentCoins) {
    if (currentCoins >= totalPrice) {
      return currentCoins -= totalPrice;
    }
    notifyListeners();
  }
}
