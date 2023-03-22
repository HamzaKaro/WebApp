import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/components/blog/blog_card_component.dart';
import 'package:poly_scrabble/services/http/http_blog_service.dart';

import '../../components/chat/chat_components.dart';
import '../../widgets/common/app_nav_bar_widget.dart';

class BlogListscreen extends StatefulWidget {
  const BlogListscreen({super.key});
  static Route get route => MaterialPageRoute(
        builder: (context) => const BlogListscreen(),
      );

  @override
  State<BlogListscreen> createState() => _BlogListscreenState();
}

class _BlogListscreenState extends State<BlogListscreen> {
  List<BlogPost> posts = [];
  @override
  void initState() {
    BlogService.getAllPosts().then((value) => setState(() {
          posts = value;
        }));
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppNavBar(
          title: translate('blog.our_latest_posts'),
        ),
        body: SizedBox(
          width: 3000,
          height: 4000,
          child: Stack(
            fit: StackFit.loose,
            children: <Widget>[
              Padding(
                padding: const EdgeInsets.all(30),
                child: Wrap(direction: Axis.horizontal, children: [
                  Center(
                    child: Text(
                      translate('blog.our_latest_posts'),
                      style: Theme.of(context).textTheme.headline3,
                    ),
                  ),
                  Container(
                    height: 30,
                  ),
                  if (posts.isEmpty)
                    Center(
                      child: Text(
                        translate('blog.no_post_written_yet'),
                        style: Theme.of(context).textTheme.headline5,
                      ),
                    ),
                  for (int i = 0; i < posts.length; i++)
                    BlogCard(post: posts[i]),
                ]),
              ),
              const ChatModal(),
            ],
          ),
        ),
        floatingActionButton: const FloatingChatButton());
  }
}

class MyWidget extends StatelessWidget {
  const MyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
