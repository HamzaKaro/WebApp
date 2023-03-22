import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/constants/avatar_constants.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/screens/auth/take_picture_screen.dart';
import 'package:poly_scrabble/screens/screens.dart';
import 'package:poly_scrabble/services/http/http_user_data.dart';
import 'package:poly_scrabble/widgets/rating.dart';
import 'package:provider/provider.dart';

class ParametersScreen extends StatefulWidget {
  const ParametersScreen({super.key});

  @override
  State<ParametersScreen> createState() => _ParametersScreenState();
}

class _ParametersScreenState extends State<ParametersScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String errorMessage = '';
  String avatar = '';
  bool isRegisterabler = false;
  String pseudo = '';

  @override
  void initState() {
    avatar = Provider.of<UserModel>(context, listen: false).avatar;
    _emailController.text =
        Provider.of<UserModel>(context, listen: false).email;
    _usernameController.text =
        Provider.of<UserModel>(context, listen: false).username;
    _usernameController.addListener(isRegisterable);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('PolyScrabble'),
      ),
      body: SingleChildScrollView(
        child: Center(
          child: Form(
            key: _formKey,
            child: Container(
              padding: const EdgeInsets.all(50),
              width: 500,
              child: Column(
                children: [
                  Text(
                    translate("profile_page.title"),
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircleAvatar(
                          radius: 70,
                          backgroundColor: Colors.transparent,
                          child: avatar != ""
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(50),
                                  child: Image(
                                    image: NetworkImage(avatar),
                                    width: 100,
                                    height: 100,
                                    fit: BoxFit.fitHeight,
                                  ),
                                )
                              : ClipRRect(
                                  borderRadius: BorderRadius.circular(50),
                                  child: const Image(
                                    image: NetworkImage(AVATAR_DEFAULT),
                                    width: 100,
                                    height: 100,
                                    fit: BoxFit.fitHeight,
                                  ),
                                )),
                      TextButton(
                        onPressed: () async {
                          var avatarURL = await showDialog(
                              context: context,
                              builder: (BuildContext context) {
                                return ImageUploads();
                              });
                          setState(() {
                            avatar = avatarURL;
                            isRegisterable();
                          });
                        },
                        child: Text(
                          translate("profile_page.avatar"),
                        ),
                      ),
                    ],
                  ),
                  TextFormField(
                      controller: _usernameController,
                      autovalidateMode: AutovalidateMode.onUserInteraction,
                      validator: ((value) {
                        bool usernameValid =
                            RegExp(r"^[a-zA-Z0-9]{5,16}$").hasMatch(value!);
                        return usernameValid
                            ? null
                            : translate("profile_page.invalid_pseudo_length");
                      }),
                      decoration: InputDecoration(
                        labelText: translate("profile_page.pseudo"),
                      )),
                  TextFormField(
                    controller: _emailController,
                    enabled: false,
                    decoration: InputDecoration(
                      labelText: translate("profile_page.email"),
                    ),
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      getCancelButton(),
                      getRegisterButton(),
                    ],
                  ),
                  ConnexionsHistoryScreen(),
                  RatingWidget(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget getCancelButton() {
    if (!userAccountChanged()) return Center();
    return TextButton(
        onPressed: () {
          cancelModifications();
        },
        child: Text(
          translate("profile_page.cancel"),
        ));
  }

  Widget getRegisterButton() {
    // if (!isRegisterabler) return Center();
    return ElevatedButton(
        onPressed: (!isRegisterabler)
            ? null
            : () {
                register();
              },
        child: Text(translate("profile_page.save")));
  }

  void register() {
    if (_formKey.currentState!.validate()) {
      try {
        if ((pseudoChanged())) {
          HttpUserData.updatePseudo(
                  Provider.of<UserModel>(context, listen: false).email,
                  _usernameController.text)
              .then((value) {
            if (!mounted) return;
            if (value != '') {
              setState(() {
                displaySnackbar('profile_page.failed_pseudo_modification');
                return;
              });
            } else {
              displaySnackbar('profile_page.successful_pseudo_modification');
              setState(() {
                isRegisterabler = false;
              });
              Provider.of<UserModel>(context, listen: false)
                  .setUsername(_usernameController.text);
            }
          });
        }
        if (avatarChanged()) {
          HttpUserData.updateAvatar(
                  Provider.of<UserModel>(context, listen: false).email, avatar)
              .then((value) {
            if (!mounted) return;
            if (value != '') {
              setState(() {
                displaySnackbar('profile_page.failed_avatar_modification');
                return;
              });
            }
            Provider.of<UserModel>(context, listen: false).setAvatar(avatar);
            setState(() {
              avatar = Provider.of<UserModel>(context, listen: false).avatar;
            });
          });
        }
        setState(() {
          isRegisterabler = false;
        });
      } catch (e) {
        setState(() {
          displaySnackbar('blog.an_error_occurred');
        });
      }
    }
  }

  bool pseudoChanged() {
    return Provider.of<UserModel>(context, listen: false).username !=
        _usernameController.text;
  }

  bool avatarChanged() {
    return Provider.of<UserModel>(context, listen: false).avatar != avatar;
  }

  bool userAccountChanged() {
    return avatarChanged() || pseudoChanged();
  }

  // TODO find the legit way to see if the username is valid from the controller
  bool isPseudoValid() {
    return RegExp(r"^[a-zA-Z0-9]{5,16}$").hasMatch(pseudo);
  }

  bool isRegisterable() {
    setState(() {
      isRegisterabler = userAccountChanged();
    });
    return userAccountChanged();
  }

  void cancelModifications() {
    setState(() {
      avatar = Provider.of<UserModel>(context, listen: false).avatar;
      _usernameController.text =
          Provider.of<UserModel>(context, listen: false).username;
    });
  }

  void displaySnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(translate(message)),
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
