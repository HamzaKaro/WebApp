import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/components/common/image_component.dart';
import 'package:poly_scrabble/screens/blog/blog_post_screen.dart';

import '../../services/http/http_blog_service.dart';

class BlogCard extends StatelessWidget {
  const BlogCard({super.key, required this.post});
  final BlogPost post;
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => BlogPostScreen(post: post),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.all(16),
        child: SizedBox(
          width: 200,
          child: Flex(
            direction: Axis.vertical,
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8.0),
                child: SizedBox(
                  width: 200,
                  height: 150,
                  child: post.cover.isNotEmpty
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(8.0),
                          child: ImageWithLoading(url: post.cover))
                      : Container(
                          color: Colors.grey,
                        ),
                ),
              ),
              Container(
                height: 10,
              ),
              Text(
                post.title ?? translate('blog.no_title'),
                style: const TextStyle(fontWeight: FontWeight.w500),
                overflow: TextOverflow.ellipsis,
              ),
              Container(
                height: 10,
              ),
              Text(
                post.description ?? translate('blog.no_description'),
                overflow: TextOverflow.clip,
                style: const TextStyle(
                  fontWeight: FontWeight.w300,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
