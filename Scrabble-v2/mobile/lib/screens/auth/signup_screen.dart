import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:poly_scrabble/constants/avatar_constants.dart';
import 'package:poly_scrabble/constants/error_messages.dart' as error_messages;
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/screens/auth/login_screen.dart';
import 'package:poly_scrabble/screens/auth/take_picture_screen.dart';
import 'package:poly_scrabble/services/auth_service.dart';
import 'package:provider/provider.dart';

import '../../services/socket_service.dart';
import '../home_screen.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String errorMessage = '';
  String urlAvatar = AVATAR_DEFAULT;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('PolyScrabble'),
          automaticallyImplyLeading: false,
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(50),
          child: Center(
            child: Form(
              key: _formKey,
              child: SizedBox(
                width: 500,
                child: Center(
                  child: Wrap(
                    alignment: WrapAlignment.center,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    runSpacing: 10,
                    spacing: 10,
                    children: [
                      Align(
                        child: Text(
                          translate("auth.create_an_account"),
                          style: TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 20),
                        ),
                      ),
                      Wrap(
                        alignment: WrapAlignment.center,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          CircleAvatar(
                              radius: 70,
                              backgroundColor: Colors.transparent,
                              child: urlAvatar != ""
                                  ? ClipRRect(
                                      borderRadius: BorderRadius.circular(50),
                                      child: Image(
                                        image: NetworkImage(urlAvatar),
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
                                urlAvatar = avatarURL;
                              });
                            },
                            child: Text(translate("signup.choose_avatar")),
                          ),
                        ],
                      ),
                      if (errorMessage.isNotEmpty)
                        Container(
                            width: double.infinity,
                            decoration: (BoxDecoration(
                              color: Colors.red[100],
                              borderRadius: BorderRadius.circular(5),
                            )),
                            padding: const EdgeInsets.all(15),
                            margin: const EdgeInsets.symmetric(
                                vertical: 20, horizontal: 0),
                            child: Text(errorMessage)),
                      TextFormField(
                        controller: _usernameController,
                        validator: ((value) {
                          bool usernameValid =
                              RegExp(r"^[a-zA-Z0-9]{5,16}$").hasMatch(value!);
                          return usernameValid
                              ? null
                              : translate("signup.error.pseudo_characters");
                        }),
                        decoration: InputDecoration(
                          labelText: translate("profile_page.pseudo"),
                        ),
                      ),
                      TextFormField(
                        validator: (value) {
                          bool emailValid =
                              RegExp(r"^[^@]+@[^@]+\.[^@]+$").hasMatch(value!);
                          return emailValid
                              ? null
                              : translate("auth.error.email_invalid");
                        },
                        controller: _emailController,
                        decoration: InputDecoration(
                          labelText: translate("profile_page.email"),
                        ),
                      ),
                      TextFormField(
                        validator: (value) {
                          return value!.length < 6
                              ? translate("auth.error.password_length")
                              : null;
                        },
                        controller: _passwordController,
                        decoration: InputDecoration(
                          labelText: translate("auth.password"),
                        ),
                        obscureText: true,
                      ),
                      const SizedBox(
                        height: 20,
                      ),
                      ElevatedButton(
                        onPressed: () {
                          if (urlAvatar == "" || urlAvatar == AVATAR_DEFAULT) {
                            setState(() {
                              errorMessage =
                                  translate("error_message.avatar_missing");
                            });
                            return;
                          }
                          if (_formKey.currentState!.validate()) {
                            try {
                              AuthService.signUp(
                                      username: _usernameController.text,
                                      email: _emailController.text,
                                      password: _passwordController.text,
                                      avatar: urlAvatar)
                                  .then((value) {
                                if (!mounted) return;
                                if (value.error.isNotEmpty) {
                                  setState(() {
                                    errorMessage = value.error;
                                  });
                                } else if (value.user != null) {
                                  setState(() {
                                    errorMessage = '';
                                  });
                                  var userModel = Provider.of<UserModel>(
                                      context,
                                      listen: false);

                                  userModel.setUser(value.user!);
                                  Provider.of<SocketService>(context,
                                          listen: false)
                                      .authentify(userModel.email);
                                  Navigator.of(context)
                                      .pushReplacement(HomeScreen.route);
                                } else {
                                  setState(() {
                                    errorMessage = error_messages.unknownError;
                                  });
                                }
                              });
                            } catch (e) {
                              setState(() {
                                errorMessage = error_messages.unknownError;
                              });
                            }
                          }
                        },
                        child: Text(translate("signup.signup")),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(translate("signup.already_have_account")),
                          TextButton(
                            onPressed: () {
                              Navigator.of(context)
                                  .pushReplacement(LoginScreen.route);
                            },
                            child: Text(translate("auth.login")),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ));
  }
}
