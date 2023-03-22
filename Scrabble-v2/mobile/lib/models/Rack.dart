class Rack {
  late String letters;

  Rack(){
    letters = '';
  }
  Map toJson() => {
      'letters': letters,
    };
}
