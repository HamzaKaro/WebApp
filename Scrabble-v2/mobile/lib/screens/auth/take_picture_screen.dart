import 'dart:async';
import 'dart:io';

import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart';
import 'package:poly_scrabble/constants/avatar_constants.dart';

class ImageUploads extends StatefulWidget {
  ImageUploads({Key? key}) : super(key: key);
  static Route get route => MaterialPageRoute(
        builder: (context) => ImageUploads(),
      );
  @override
  _ImageUploadsState createState() => _ImageUploadsState();
}

class _ImageUploadsState extends State<ImageUploads> {
  File? _photo;
  final ImagePicker _picker = ImagePicker();
  int index_clicked = INVALID_PICK;
  String urlUpload = AVATAR_DEFAULT;
  List<String> images = LISTE_AVATARS;

  Future imgFromGallery() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);

    setState(() {
      if (pickedFile != null) {
        _photo = File(pickedFile.path);
        uploadFile(_photo);
      } else {
        print(translate("upload_avatar.no_image_selected"));
      }
    });
  }

  Future imgFromCamera() async {
    final firstFile = await _picker.pickImage(source: ImageSource.camera);
    if (firstFile != null) {
      final pickedFile = firstFile;
      setState(() {
        if (pickedFile != null) {
          _photo = File(pickedFile.path);
          uploadFile(_photo);
        } else {
          print(translate("upload_avatar.no_image_selected"));
        }
      });
    }
  }

  Future uploadFile(File? photo) async {
    if (_photo == null) return;
    final fileName = basename(photo!.path);
    const destination = 'avatars/';

    try {
      final ref = FirebaseStorage.instance.ref(destination).child(fileName);
      TaskSnapshot uploadTask = await ref.putFile(_photo!);
      String pathdownload = await uploadTask.ref.getDownloadURL();
      this.urlUpload = pathdownload;
      setState(() {});
    } catch (e) {
      print('error occured');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Avatar'),
      ),
      body: Container(
        child: Column(children: [
          Center(
              child: Column(children: [
            GestureDetector(
                onTap: () {
                  _showPicker(context);
                },
                child: getPreview(context)),
            ElevatedButton(
                style: ElevatedButton.styleFrom(
                  foregroundColor: Color.fromARGB(255, 193, 228, 240),
                  backgroundColor: Color.fromARGB(255, 8, 165, 244),
                ).copyWith(elevation: ButtonStyleButton.allOrNull(0.0)),
                onPressed: () {
                  index_clicked = PICK_UPLOADED_AVATAR;
                  _showPicker(context);
                },
                child: Text(translate("upload_avatar.take_picture")))
          ])),
          getGridAvatar(context),
          Center(
              child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context, sendUrlPicked());
                    return;
                    // TODO : Remove this as soon as we know it is functional
                    // Navigator.of(context).pushReplacement(MaterialPageRoute(
                    //   builder: (context) => SignUpScreen(
                    //       urlAvatar: sendUrlPicked(),
                    //   ),
                    // ));
                  },
                  child: Text(translate("upload_avatar.done"))))
        ]),
      ),
    );
  }

  Widget getGridAvatar(context) {
    return GridView.builder(
        scrollDirection: Axis.vertical,
        shrinkWrap: true,
        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
            maxCrossAxisExtent: 200,
            childAspectRatio: 3 / 2,
            crossAxisSpacing: 20,
            mainAxisSpacing: 20),
        itemCount: 6,
        itemBuilder: (BuildContext ctx, index) {
          return GestureDetector(
              onTap: () {
                setState(() {
                  index_clicked = index;
                });
              },
              child: CircleAvatar(
                  backgroundColor: (index_clicked == index)
                      ? Colors.green
                      : Colors.transparent,
                  radius: 110,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(50),
                    // radius: 45,
                    child: Image(
                      image: NetworkImage(images.elementAt(index)),
                      width: 100,
                      height: 100,
                      fit: BoxFit.fitHeight,
                    ),
                  )));
        });
  }

  Widget getPreview(context) {
    return GestureDetector(
        onTap: () {
          setState(() {
            index_clicked = PICK_UPLOADED_AVATAR;
          });
        },
        child: CircleAvatar(
          radius: 70,
          backgroundColor:
              (index_clicked == 200) ? Colors.green : Colors.transparent,
          child: urlUpload != AVATAR_DEFAULT
              ? ClipRRect(
                  borderRadius: BorderRadius.circular(50),
                  child: Image.file(
                    _photo!,
                    width: 100,
                    height: 100,
                    fit: BoxFit.fitHeight,
                  ),
                )
              : Container(
                  decoration: BoxDecoration(
                      color: Color.fromARGB(0, 238, 238, 238),
                      borderRadius: BorderRadius.circular(50)),
                  width: 100,
                  height: 100,
                  child: Icon(
                    Icons.camera_alt,
                    color: Colors.grey[800],
                  ),
                ),
        ));
  }

  void _showPicker(context) {
    showModalBottomSheet(
        context: context,
        builder: (BuildContext bc) {
          return SafeArea(
            child: Wrap(
              children: <Widget>[
                ListTile(
                    leading: const Icon(Icons.photo_library),
                    title: const Text('Gallery'),
                    onTap: () {
                      imgFromGallery();
                      Navigator.of(context).pop();
                    }),
                ListTile(
                  leading: const Icon(Icons.photo_camera),
                  title: const Text('Camera'),
                  onTap: () {
                    imgFromCamera();
                    Navigator.of(context).pop();
                  },
                ),
              ],
            ),
          );
        });
  }

  bool hasSelected() {
    return index_clicked != INVALID_PICK;
  }

  String sendUrlPicked() {
    if (index_clicked == PICK_UPLOADED_AVATAR) {
      return urlUpload;
    } else {
      return images.elementAt(index_clicked);
    }
  }
}
