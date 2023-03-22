import 'dart:convert';
import 'dart:developer';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

// interface Post {
//     id: string;
//     title: { en: string; fr: string };
//     description: { en: string; fr: string };
//     cover: string;
//     content: { en: string; fr: string };
//     updatedAt: number;
//     createdAt: number;
//     publishedAt: number;
//     isPublished: boolean;
// }

class BlogPost {
  final String id;
  final String title;
  final String description;
  final String cover;
  final String content;
  final int updatedAt;
  final int createdAt;
  final int publishedAt;
  final String status;
  final String author;

  BlogPost(
      {this.id = '',
      required this.title,
      required this.description,
      required this.cover,
      required this.content,
      this.updatedAt = 0,
      this.createdAt = 0,
      this.publishedAt = 0,
      this.status = 'published',
      this.author = 'Admin'});

  factory BlogPost.fromJson(Map<String, dynamic> json) {
    return BlogPost(
      id: json['id'] ?? 0,
      title: json['title'] ?? "",
      description: json['description'] ?? "",
      cover: json['cover'] ?? '',
      content: json['content'] ?? "",
      updatedAt: int.parse(json['updatedAt'].toString()) ?? 0,
      createdAt: int.parse(json['createdAt'].toString()) ?? 0,
      publishedAt: int.parse(json['publishedAt'].toString()) ?? 0,
      status: json['status'] ?? 'published',
      author: json['author'] ?? 'Admin',
    );
  }

  Map toJson() {
    return <String, dynamic>{
      'id': id,
      'title': title,
      'description': description,
      'cover': cover,
      'content': content,
      'updatedAt': updatedAt,
      'createdAt': createdAt,
      'publishedAt': publishedAt,
      'author': author,
      'status': status,
    };
  }
}

class BlogPostsList {
  final List<BlogPost> posts;

  BlogPostsList({required this.posts});

  factory BlogPostsList.fromJson(List<dynamic> json) {
    return BlogPostsList(
      posts: json.map((post) => BlogPost.fromJson(post)).toList(),
    );
  }
}

class BlogService {
  static Future<List<BlogPost>> getAllPosts() async {
    try {
      var response =
          await http.get(Uri.parse('${dotenv.get('SERVER_URL')}/api/blog'));
      var data = jsonDecode(response.body);

      switch (response.statusCode) {
        case 200:
          List<BlogPost> posts =
              data.map<BlogPost>((post) => BlogPost.fromJson(post)).toList();
          return posts;
        default:
          return [];
      }
    } catch (e) {
      log(e.toString());
      return [];
    }
  }

  static Future<BlogPost?> getPostById(String id) async {
    try {
      var response =
          await http.get(Uri.parse('${dotenv.get('SERVER_URL')}/api/blog/$id'));
      var data = jsonDecode(response.body);

      switch (response.statusCode) {
        case 200:
          BlogPost post = BlogPost.fromJson(data);
          return post;
        default:
          return null;
      }
    } catch (e) {
      log(e.toString());
      return null;
    }
  }

  static Future<BlogPost?> createPost(BlogPost post) async {
    try {
      var response =
          await http.post(Uri.parse('${dotenv.get('SERVER_URL')}/api/blog'),
              headers: <String, String>{
                'Content-Type': 'application/json; charset=UTF-8',
              },
              body: json.encode(post));

      switch (response.statusCode) {
        case 200:
          var data = jsonDecode(response.body);
          BlogPost post = BlogPost.fromJson(data);
          return post;
        default:
          return null;
      }
    } catch (e) {
      log(e.toString());
      return null;
    }
  }

  static Future<BlogPost?> editPost(String id, BlogPost post) async {
    try {
      print("ID $id");
      var response = await http.patch(
          Uri.parse('${dotenv.get('SERVER_URL')}/api/blog/$id'),
          headers: <String, String>{
            'Content-Type': 'application/json; charset=UTF-8',
          },
          body: json.encode(post));

      switch (response.statusCode) {
        case 200:
          var data = jsonDecode(response.body);
          BlogPost post = BlogPost.fromJson(data);
          return post;
        default:
          return null;
      }
    } catch (e) {
      log(e.toString());
      return null;
    }
  }

  static Future<bool> deletePost(String id) async {
    try {
      print("ID $id");
      var response = await http.delete(
        Uri.parse('${dotenv.get('SERVER_URL')}/api/blog/$id'),
      );

      var data = jsonDecode(response.body);
      print("VALUE $data");
      return data;
    } catch (e) {
      log(e.toString());
      return false;
    }
  }
}
