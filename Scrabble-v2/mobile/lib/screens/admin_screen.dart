import 'package:flutter/material.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:poly_scrabble/components/chat/chat_components.dart';
import 'package:poly_scrabble/components/configuration/text_form.dart'
    as component_text;
import 'package:poly_scrabble/screens/blog/admin_blog_list_screen.dart';
import 'package:poly_scrabble/screens/blog/create_post_screen.dart';
import 'package:poly_scrabble/services/rooms_service.dart';
import 'package:poly_scrabble/services/socket_service.dart';
import 'package:poly_scrabble/services/sound_service.dart';
import 'package:poly_scrabble/widgets/invitation_popup_widget.dart';
import 'package:provider/provider.dart';

import '../models/user.dart';
import '../widgets/common/app_nav_bar_widget.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  static Route get route => MaterialPageRoute(
        builder: (context) => const AdminScreen(),
      );

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  @override
  void initState() {
    var userModel = Provider.of<UserModel>(context, listen: false);
    Provider.of<SoundService>(context, listen: false).turnOn =
        userModel.preferences.soundAnimations;
    Provider.of<SocketService>(context, listen: false).on(
        'invite-friend',
        (invitation) => {
              if (!Provider.of<RoomService>(context, listen: false).isInRoom)
                {
                  showDialog(
                    context: context,
                    builder: (BuildContext dialogContext) {
                      return InvitationPopup(
                          invitation:
                              Provider.of<RoomService>(context, listen: false)
                                  .convertInvitation(invitation));
                    },
                  )
                }
            });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    changeLocale(context,
        Provider.of<UserModel>(context, listen: true).preferences.language);
    return Scaffold(
        appBar: AppNavBar(title: translate('pages.admin')),
        body: SizedBox(
          width: 3000,
          height: 4000,
          child: Stack(
            fit: StackFit.loose,
            children: <Widget>[
              Container(
                  alignment: Alignment.center,
                  child: SizedBox(child:
                      Consumer<UserModel>(builder: ((context, user, child) {
                    return Column(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // TITLE PAGE //
                        component_text.MainTitle(translate("pages.admin")),
                        // Insert options button list t
                        Column(
                          children: [
                            ElevatedButton(
                                onPressed: () {
                                  Navigator.of(context)
                                      .push(CreatePostScreen.route);
                                },
                                style: ElevatedButton.styleFrom(
                                    minimumSize: const Size(350, 40)),
                                child: Text(translate('blog.create_new_post'),
                                    style: GoogleFonts.montserrat(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w600,
                                    ))),
                            ElevatedButton(
                                onPressed: () {
                                  Navigator.of(context)
                                      .push(AdminBlogListScreen.route);
                                },
                                style: ElevatedButton.styleFrom(
                                    minimumSize: const Size(350, 40)),
                                child: Text(translate('blog.see_all_posts'),
                                    style: GoogleFonts.montserrat(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w600,
                                    ))),
                          ],
                        ),
                      ],
                    );
                  })))),
              const ChatModal(),
            ],
          ),
        ),
        floatingActionButton: const FloatingChatButton());
  }
}
