import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:provider/provider.dart';

import '../../models/user.dart';
import '../../screens/screens.dart';
import '../../services/auth_service.dart';
import '../../services/services.dart';
import '../friends.dart';
import '../user_settings.dart';

class AppNavBar extends StatefulWidget with PreferredSizeWidget {
  final bool allowBack;
  final String title;
  AppNavBar({
    Key? key,
    this.allowBack = true,
    this.title = '',
  }) : super(key: key);

  @override
  State<AppNavBar> createState() => _AppNavBarState();

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

class _AppNavBarState extends State<AppNavBar> {
  @override
  Widget build(BuildContext context) {
    return AppBar(
        title: Text(widget.title),
        actions: <Widget>[
          Consumer<UserModel>(builder: ((context, user, child) {
            return PopupMenuButton(
                // add icon, by default "3 dot" icon

                // icon: Icon(Icons.book)
                itemBuilder: (context) {
              return [
                PopupMenuItem<int>(
                  value: 0,
                  child: Row(
                    children: <Widget>[
                      Icon(
                        Icons.account_circle,
                        color:
                            Theme.of(context).textSelectionTheme.selectionColor,
                        size: 25,
                      ),
                      Text(translate("app_bar_menu.profile")),
                    ],
                  ),
                ),
                PopupMenuItem<int>(
                  value: 1,
                  child: Row(
                    children: <Widget>[
                      Icon(
                        Icons.settings,
                        color:
                            Theme.of(context).textSelectionTheme.selectionColor,
                        size: 25,
                      ),
                      Text(translate("app_bar_menu.settings")),
                    ],
                  ),
                ),
                PopupMenuItem<int>(
                  value: 2,
                  child: Row(
                    children: <Widget>[
                      Icon(
                        Icons.insert_chart,
                        color:
                            Theme.of(context).textSelectionTheme.selectionColor,
                        size: 25,
                      ),
                      Text(translate("app_bar_menu.stats")),
                    ],
                  ),
                ),
                PopupMenuItem<int>(
                  value: 3,
                  child: Row(
                    children: <Widget>[
                      Icon(
                        Icons.group,
                        color:
                            Theme.of(context).textSelectionTheme.selectionColor,
                        size: 25,
                      ),
                      Text(translate("app_bar_menu.friendlist")),
                    ],
                  ),
                ),
                PopupMenuItem<int>(
                  value: 4,
                  child: Row(
                    children: <Widget>[
                      Icon(
                        Icons.logout,
                        color:
                            Theme.of(context).textSelectionTheme.selectionColor,
                        size: 25,
                      ),
                      Text(translate("app_bar_menu.logout")),
                    ],
                  ),
                ),
              ];
            }, onSelected: (value) async {
              if (value == 0) {
                showDialog(
                    context: context,
                    builder: (context) => const ParametersScreen());
              } else if (value == 1) {
                await showDialog(
                    context: context,
                    builder: (BuildContext context) {
                      return SettingsPage();
                    });
                setState(() {});
              } else if (value == 2) {
                showDialog(
                    context: context,
                    builder: (context) => const StatisticsScreen());
              } else if (value == 3) {
                showDialog(
                    context: context, builder: (context) => FriendsPage());
              } else if (value == 4) {
                AuthService.logout(user.username).then((value) =>
                    Navigator.pushReplacement(context, LoginScreen.route));
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text(translate("auth.disconnection_success")),
                    duration: const Duration(seconds: 5),
                    action: SnackBarAction(
                      label: translate('chat.DISMISS'),
                      onPressed: () {
                        ScaffoldMessenger.of(context).hideCurrentSnackBar();
                      },
                    )));
                Provider.of<ChatService>(context, listen: false).reset();
                Provider.of<UserModel>(context, listen: false).reset();
              }
            });
          })),
        ],
        automaticallyImplyLeading: widget.allowBack);
  }
}
