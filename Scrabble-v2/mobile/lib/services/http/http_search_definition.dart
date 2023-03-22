import 'dart:convert';
import 'dart:developer';
import 'package:http/http.dart' as http;
import 'package:poly_scrabble/constants/error_messages.dart' as error_messages;



class ServerSearchResponse {
  final List<dynamic> nature;
  final List<dynamic> natureDef;
  final String errorApi;
  ServerSearchResponse({required this.nature, required this.natureDef, required this.errorApi});

  factory ServerSearchResponse.fromJson(Map<String, dynamic> json) {
    return ServerSearchResponse(nature: json['nature'], natureDef: json['natureDef'], errorApi: json['error']);
  }
}
class SearchResponse {
  final String error;
  final ServerSearchResponse? search;
  SearchResponse({required this.error, required this.search});

  factory SearchResponse.fromJson(Map<String, dynamic> json) {
    // TODO error is from the json
    return SearchResponse(error: '', search: ServerSearchResponse.fromJson(json));
  }
}
class HttpSearchDefinition {
  static Future<SearchResponse> getWordDefinition(String word) async {
    try {
      var response = await http.post(
          Uri.parse('https://recherche-de-mots.herokuapp.com/word-definition'),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
        'enctype' : 'multipart/form-data',
      },
        encoding: Encoding.getByName('utf-8'),
      body: {"motWiki" : word });
      switch (response.statusCode) {
        case 200:
          return SearchResponse.fromJson(jsonDecode(response.body));
          // return SearchResponse(search: jsonDecode(response.body), error: '');
        default:
          return SearchResponse(search: null, error: error_messages.unknownError);
      }
    } catch (e) {
      log(e.toString());
      return SearchResponse(search: null, error: 'catched an error');
    }
  }
}
