import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/screens/admin_screen.dart';
import 'package:poly_scrabble/screens/blog/blog_upload_image_screen.dart';
import 'package:poly_scrabble/widgets/common/app_nav_bar_widget.dart';

import '../../components/common/image_component.dart';
import '../../services/http/http_blog_service.dart';

class EditPostScreen extends StatefulWidget {
  final String id;
  final BlogPost? post;
  const EditPostScreen({super.key, required this.post, required this.id});

  static Route get route => MaterialPageRoute(
        builder: (context) => const EditPostScreen(id: '', post: null),
      );

  @override
  State<EditPostScreen> createState() => _EditPostScreenState();
}

class _EditPostScreenState extends State<EditPostScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController titleController;
  late TextEditingController descriptionController;
  late TextEditingController contentController;
  var urlCover = '';
  String status = '';
  final statusList = ['draft', 'published', 'archived'];

  @override
  void initState() {
    titleController = TextEditingController(text: widget.post?.title);
    descriptionController =
        TextEditingController(text: widget.post?.description);
    contentController = TextEditingController(text: widget.post?.content);
    urlCover = widget.post?.cover ?? '';
    status = widget.post?.status ?? 'published';
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppNavBar(title: translate('blog.edit_post')),
        body: SingleChildScrollView(
          child: Container(
              margin: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
              child: Form(
                key: _formKey,
                child: Wrap(
                  runSpacing: 16,
                  children: [
                    Center(
                        child: Text(
                      translate('blog.edit_post'),
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
                                return 'Please enter some text';
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
                        SaveButton(
                            formKey: _formKey,
                            widget: widget,
                            titleController: titleController,
                            descriptionController: descriptionController,
                            contentController: contentController,
                            urlCover: urlCover,
                            status: status),
                      ],
                    ),
                    Center(
                      child: ElevatedButton(
                          style: ButtonStyle(
                              backgroundColor:
                                  MaterialStateProperty.all(Colors.red)),
                          onPressed: () {
                            try {
                              BlogService.deletePost(widget.id).then((value) =>
                                  {
                                    if (value == true)
                                      {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(SnackBar(
                                          content: Text(translate(
                                              "blog.post_deleted_successfully")),
                                          duration: const Duration(seconds: 5),
                                          action: SnackBarAction(
                                            label: translate('chat.DISMISS'),
                                            onPressed: () {
                                              ScaffoldMessenger.of(context)
                                                  .hideCurrentSnackBar();
                                            },
                                          ),
                                        )),
                                        Navigator.of(context).pushReplacement(
                                          AdminScreen.route,
                                        )
                                      }
                                    else
                                      {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(SnackBar(
                                          content: Text(translate(
                                              "blog.error_while_deleting_post")),
                                          duration: const Duration(seconds: 3),
                                          action: SnackBarAction(
                                            label: translate('chat.DISMISS'),
                                            onPressed: () {
                                              ScaffoldMessenger.of(context)
                                                  .hideCurrentSnackBar();
                                            },
                                          ),
                                        ))
                                      }
                                  });
                            } catch (e) {
                              log(e.toString());
                              ScaffoldMessenger.of(context)
                                  .showSnackBar(SnackBar(
                                content: Text(translate(
                                    "blog.error_while_deleting_post")),
                                duration: const Duration(seconds: 3),
                                action: SnackBarAction(
                                  label: translate('chat.DISMISS'),
                                  onPressed: () {
                                    ScaffoldMessenger.of(context)
                                        .hideCurrentSnackBar();
                                  },
                                ),
                              ));
                            }
                          },
                          child: Text(translate('blog.delete_post'))),
                    ),
                  ],
                ),
              )),
        ));
  }
}

class SaveButton extends StatelessWidget {
  const SaveButton({
    Key? key,
    required GlobalKey<FormState> formKey,
    required this.widget,
    required this.titleController,
    required this.descriptionController,
    required this.contentController,
    required this.urlCover,
    required this.status,
  })  : _formKey = formKey,
        super(key: key);

  final GlobalKey<FormState> _formKey;
  final EditPostScreen widget;
  final TextEditingController titleController;
  final TextEditingController descriptionController;
  final TextEditingController contentController;
  final String urlCover;
  final String status;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
        onPressed: () async {
          if (_formKey.currentState!.validate()) {
            try {
              var post = BlogPost(
                id: widget.id,
                createdAt: widget.post?.createdAt ?? 0,
                publishedAt: widget.post?.publishedAt ?? 0,
                updatedAt: widget.post?.updatedAt ?? 0,
                title: titleController.text,
                description: descriptionController.text,
                content: contentController.text,
                cover: urlCover,
                status: status,
              );

              BlogService.editPost(widget.id, post).then((value) => {
                    if (value != null)
                      {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                          content:
                              Text(translate("blog.post_updated_successfully")),
                          duration: const Duration(seconds: 3),
                          action: SnackBarAction(
                            label: translate('chat.DISMISS'),
                            onPressed: () {},
                          ),
                        ))
                      }
                    else
                      {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                          content: Text(translate("blog.an_error_occurred")),
                          duration: const Duration(seconds: 3),
                          action: SnackBarAction(
                            label: translate('chat.DISMISS'),
                            onPressed: () {
                              ScaffoldMessenger.of(context)
                                  .hideCurrentSnackBar();
                            },
                          ),
                        ))
                      }
                  });
            } catch (e) {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text(translate("blog.an_error_occurred")),
                duration: const Duration(seconds: 3),
                action: SnackBarAction(
                  label: translate('chat.DISMISS'),
                  onPressed: () {
                    ScaffoldMessenger.of(context).hideCurrentSnackBar();
                  },
                ),
              ));
            }
          }
        },
        child: Text(translate('blog.save')));
  }
}
