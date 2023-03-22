import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:poly_scrabble/constants/error_messages.dart' as error_messages;
import 'package:poly_scrabble/models/shared_preferences.dart';
import 'package:poly_scrabble/screens/screens.dart';
import 'package:poly_scrabble/services/chat_service.dart';
import 'package:poly_scrabble/services/socket_service.dart';
import 'package:poly_scrabble/services/sound_service.dart';
import 'package:provider/provider.dart';

import '../../models/user.dart';
import '../../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  static Route get route => MaterialPageRoute(
        builder: (context) => const LoginScreen(),
      );

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final SoundService soundService = SoundService(true);
  final _formKey = GlobalKey<FormState>();
  String errorMessage = '';

  // TODO remove this on the final version of the project
  void hardcodedLogin(String email, String password) {
    setState(() {
      _emailController.text = email;
      _passwordController.text = password;
    });
    login();
  }

  void login() {
    if (_formKey.currentState!.validate()) {
      try {
        AuthService.login(
                email: _emailController.text,
                password: _passwordController.text)
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
            var userModel = Provider.of<UserModel>(context, listen: false);
            Provider.of<UserModel>(context, listen: false).setUser(value.user!);
            Provider.of<ChatService>(context, listen: false).getUserChannels();
            Provider.of<SocketService>(context, listen: false)
                .authentify(userModel.email);
            Get.to(() => const HomeScreen());
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
  }

  @override
  Widget build(BuildContext context) {
    final themeChange = Provider.of<DarkThemeProvider>(context);

    return Scaffold(
        appBar: AppBar(
          title: const Text('PolyScrabble'),
          // Disactivate back button in the AppBar
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
                      // Insert the main title of page
                      Align(
                          child: Text(
                        translate("auth.login"),
                        style: TextStyle(
                            fontSize: 40, fontWeight: FontWeight.bold),
                      )),
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
                        validator: (value) {
                          bool emailValid =
                              RegExp(r"^[^@]+@[^@]+\.[^@]+$").hasMatch(value!);
                          return emailValid ? null : "L'email est invalide.";
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
                      Wrap(direction: Axis.vertical, spacing: 10, children: [
                        ElevatedButton(
                            onPressed: () {
                              if (_formKey.currentState!.validate()) {
                                try {
                                  AuthService.login(
                                          email: _emailController.text,
                                          password: _passwordController.text)
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
                                      Provider.of<ChatService>(context,
                                              listen: false)
                                          .getUserChannels();
                                      Provider.of<SocketService>(context,
                                              listen: false)
                                          .authentify(userModel.email);
                                      changeLocale(context,
                                          userModel.preferences.language);
                                      Navigator.of(context)
                                          .pushReplacement(HomeScreen.route);
                                    } else {
                                      setState(() {
                                        errorMessage =
                                            error_messages.unknownError;
                                      });
                                    }
                                  });
                                } catch (e) {
                                  print(e);
                                  setState(() {
                                    errorMessage = error_messages.unknownError;
                                  });
                                }
                              }
                            },
                            // (todo) If I have enough time, find something that you add a space between the connexion button and the end of form login
                            style: ElevatedButton.styleFrom(
                                minimumSize: const Size(300, 40)),
                            child: Text(translate("auth.login"),
                                style: GoogleFonts.montserrat(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                ))),
                      ]),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(translate("auth.no_account_yet")),
                          TextButton(
                            onPressed: () {
                              Navigator.of(context)
                                  .pushReplacement(MaterialPageRoute(
                                builder: (context) => SignUpScreen(),
                              ));
                            },
                            child: Text(translate("auth.create_an_account")),
                          ),
                        ],
                      ),

                      TextButton(
                        onPressed: () {
                          changeLocale(context, 'en');
                        },
                        child: const Text("Translate to english"),
                      ),
                      TextButton(
                        onPressed: () {
                          changeLocale(context, 'fr');
                        },
                        child: const Text("Traduire en français"),
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
