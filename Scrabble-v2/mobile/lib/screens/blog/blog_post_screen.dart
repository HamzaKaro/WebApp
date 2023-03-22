import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/widgets/common/app_nav_bar_widget.dart';

import '../../services/http/http_blog_service.dart';

class BlogPostScreen extends StatelessWidget {
  final BlogPost? post;

  const BlogPostScreen({super.key, required this.post});

  static Route get route => MaterialPageRoute(
        builder: (context) => const BlogPostScreen(post: null),
      );
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppNavBar(title: post?.title ?? ''),
      body: SingleChildScrollView(
        child: Wrap(
          children: [
            Container(
              margin: const EdgeInsets.only(bottom: 20),
              color: Colors.grey,
              width: double.infinity,
              height: 200,
              child: post?.cover != null && post!.cover.isNotEmpty
                  ? Image.network(
                      post?.cover ?? '',
                      fit: BoxFit.cover,
                      loadingBuilder: (BuildContext context, Widget child,
                          ImageChunkEvent? loadingProgress) {
                        if (loadingProgress == null) return child;
                        return Center(
                          child: CircularProgressIndicator(
                            value: loadingProgress.expectedTotalBytes != null
                                ? loadingProgress.cumulativeBytesLoaded /
                                    loadingProgress.expectedTotalBytes!
                                : null,
                          ),
                        );
                      },
                    )
                  : null,
            ),
            Container(
              margin: const EdgeInsets.all(10),
              padding: const EdgeInsets.all(32),
              child: Wrap(
                direction: Axis.vertical,
                children: [
                  Row(
                    children: [
                      Text(
                        post?.title ?? '',
                        style: const TextStyle(fontSize: 32),
                      ),
                    ],
                  ),
                  const SizedBox(
                    height: 16,
                  ),
                  Row(
                    children: [
                      Text(
                        post?.description ?? '',
                        style: const TextStyle(fontWeight: FontWeight.w300),
                      ),
                    ],
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(vertical: 32, horizontal: 0),
                    child: Html(data: post?.content ?? '', style: {
                      "body": Style(
                        padding: EdgeInsets.zero,
                        margin: EdgeInsets.zero,
                        fontSize: FontSize(18.0),
                      ),
                    }),
                  ),
                  const Divider(
                    color: Colors.grey,
                    height: 10,
                  ),
                  Text(
                    '${translate("blog.written_by")} ${post?.author}',
                    style: const TextStyle(fontSize: 16),
                  ),
                  Text(
                    '${translate("blog.published_on")} ${DateTime.fromMillisecondsSinceEpoch(post?.publishedAt ?? 0).toString()}',
                    style: const TextStyle(fontSize: 16),
                  ),
                  Text(
                    '${translate("blog.updated_on")} ${DateTime.fromMillisecondsSinceEpoch(post?.updatedAt ?? 0).toString()}',
                    style: const TextStyle(fontSize: 16),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
