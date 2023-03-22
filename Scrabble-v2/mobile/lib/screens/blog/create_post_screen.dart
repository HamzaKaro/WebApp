import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/screens/blog/blog_upload_image_screen.dart';
import 'package:poly_scrabble/screens/blog/edit_post_screen.dart';
import 'package:poly_scrabble/services/http/http_blog_service.dart';
import 'package:poly_scrabble/widgets/common/app_nav_bar_widget.dart';
import 'package:provider/provider.dart';

import '../../components/common/image_component.dart';

class CreatePostScreen extends StatefulWidget {
  const CreatePostScreen({super.key});

  static Route get route => MaterialPageRoute(
        builder: (context) => const CreatePostScreen(),
      );

  @override
  State<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends State<CreatePostScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController titleController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();
  final TextEditingController contentController = TextEditingController();
  final statusList = ['draft', 'published', 'archived'];
  String status = 'published';
  var urlCover = '';
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppNavBar(title: translate('blog.create_new_post')),
        body: SingleChildScrollView(
          child: Container(
              margin: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Wrap(
                  runSpacing: 16,
                  children: [
                    Center(
                        child: Text(
                      translate('blog.create_new_post'),
                      style: const TextStyle(
                          fontSize: 32, fontWeight: FontWeight.w500),
                    )),
                    Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8.0),
                          child: Container(
                            height: 275,
                            width: double.infinity,
                            color: Colors.grey,
                            child: urlCover.isNotEmpty
                                ? ImageWithLoading(url: urlCover)
                                : null,
                          ),
                        ),
                        Positioned.fill(
                          child: Center(
                            child: ElevatedButton(
                              onPressed: () async {
                                var coverURL = await showDialog(
                                    context: context,
                                    builder: (BuildContext context) {
                                      return const BlogUploadImageScreen();
                                    });
                                setState(() {
                                  urlCover = coverURL;
                                });
                              },
                              child: Text(translate('blog.upload_cover_image')),
                            ),
                          ),
                        )
                      ],
                    ),
                    Column(
                      children: [
                        Container(
                          margin: const EdgeInsets.symmetric(vertical: 10),
                          alignment: Alignment.centerLeft,
                          child: Text(
                            translate('blog.title'),
                            style: const TextStyle(
                                fontWeight: FontWeight.w500, fontSize: 16),
                          ),
                        ),
                        TextFormField(
                            minLines: 1,
                            maxLines: null,
                            keyboardType: TextInputType.multiline,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return translate('blog.must_not_be_empty');
                              }
                              return null;
                            },
                            controller: titleController,
                            decoration: InputDecoration(
                              border: const OutlineInputBorder(),
                              labelText: translate('blog.title'),
                              hintText: translate('blog.title'),
                            )),
                      ],
                    ),
                    Column(
                      children: [
                        Container(
                          margin: const EdgeInsets.symmetric(vertical: 10),
                          alignment: Alignment.centerLeft,
                          child: Text(
                            translate('blog.description'),
                            style: const TextStyle(
                                fontWeight: FontWeight.w500, fontSize: 16),
                          ),
                        ),
                        TextFormField(
                            minLines: 1,
                            maxLines: null,
                            keyboardType: TextInputType.multiline,
                            controller: descriptionController,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return translate('blog.must_not_be_empty');
                              }
                              return null;
                            },
                            decoration: InputDecoration(
                              border: const OutlineInputBorder(),
                              labelText: translate('blog.description'),
                              hintText: translate('blog.description'),
                            )),
                      ],
                    ),
                    Column(
                      children: [
                        Container(
                          margin: const EdgeInsets.symmetric(vertical: 10),
                          alignment: Alignment.centerLeft,
                          child: Text(
                            translate('blog.content'),
                            style: const TextStyle(
                                fontWeight: FontWeight.w500, fontSize: 16),
                          ),
                        ),
                        TextFormField(
                            minLines: 10,
                            maxLines: null,
                            keyboardType: TextInputType.multiline,
                            controller: contentController,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return translate('blog.must_not_be_empty');
                              }
                              return null;
                            },
                            decoration: InputDecoration(
                              border: const OutlineInputBorder(),
                              labelText: translate('blog.content'),
                              hintText: translate('blog.content'),
                            )),
                      ],
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        DropdownButton<String>(
                          value: status,
                          icon: const Icon(Icons.arrow_downward),
                          elevation: 16,
                          style: const TextStyle(color: Colors.green),
                          underline: Container(
                            height: 2,
                            color: Colors.green,
                          ),
                          onChanged: (String? value) {
                            // This is called when the user selects an item.
                            setState(() {
                              status = value!;
                            });
                          },
                          items: statusList
                              .map<DropdownMenuItem<String>>((String value) {
                            return DropdownMenuItem<String>(
                                value: value,
                                child: Text(
                                    '${value[0].toUpperCase()}${value.substring(1).toLowerCase()}'));
                          }).toList(),
                        ),
                        ElevatedButton(
                            onPressed: () async {
                              if (_formKey.currentState!.validate()) {
                                try {
                                  var post = BlogPost(
                                    title: titleController.text,
                                    description: descriptionController.text,
                                    content: contentController.text,
                                    cover: urlCover,
                                    author: Provider.of<UserModel>(context,
                                            listen: false)
                                        .username,
                                    status: status,
                                  );

                                  BlogService.createPost(post).then((value) => {
                                        if (value?.id != null)
                                          {
                                            ScaffoldMessenger.of(context)
                                                .showSnackBar(SnackBar(
                                              content: Text(translate(
                                                  "blog.post_created_successfully")),
                                              duration:
                                                  const Duration(seconds: 3),
                                              action: SnackBarAction(
                                                label:
                                                    translate('chat.DISMISS'),
                                                onPressed: () {
                                                  ScaffoldMessenger.of(context)
                                                      .hideCurrentSnackBar();
                                                },
                                              ),
                                            )),
                                            Navigator.pushReplacement(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (context) =>
                                                      EditPostScreen(
                                                          id: value!.id,
                                                          post: post),
                                                ))
                                          }
                                      });
                                } catch (e) {
                                  print(e);
                                }
                              }
                            },
                            child: Text(translate("blog.create_post"))),
                      ],
                    ),
                  ],
                ),
              )),
        ));
  }
}
