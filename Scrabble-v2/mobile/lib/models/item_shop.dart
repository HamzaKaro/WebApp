class ItemShop {
  final String name;
  final int price;
  final bool isAvailable;

  ItemShop({
    required this.name,
    required this.price,
    required this.isAvailable,
  });

  factory ItemShop.fromJson(Map<String, dynamic> json) {
    return ItemShop(
      name: json['name'],
      price: json['price'],
      isAvailable: json['isAvailable'],
    );
  }
}
