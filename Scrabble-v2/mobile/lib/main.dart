import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_translate/flutter_translate.dart';
import 'package:get/get_navigation/src/root/get_material_app.dart';
import 'package:get/route_manager.dart';
import 'package:poly_scrabble/models/shared_preferences.dart';
import 'package:poly_scrabble/models/shop/cart.dart';
import 'package:poly_scrabble/models/shop/catalog.dart';
import 'package:poly_scrabble/models/styles.dart';
import 'package:poly_scrabble/models/user.dart';
import 'package:poly_scrabble/screens/auth/login_screen.dart';
import 'package:poly_scrabble/screens/auth/signup_screen.dart';
import 'package:poly_scrabble/screens/home_screen.dart';
import 'package:poly_scrabble/services/%20friends_service.dart';
import 'package:poly_scrabble/services/auth_service.dart';
import 'package:poly_scrabble/services/rooms_service.dart';
import 'package:poly_scrabble/services/services.dart';
import 'package:poly_scrabble/services/sound_service.dart';
import 'package:provider/provider.dart';

Future main() async {
  await dotenv.load(fileName: ".env");

  var delegate = await LocalizationDelegate.create(
      fallbackLocale: 'en', supportedLocales: ['en', 'fr']);

  SocketService socketService = SocketService();
  socketService.connect();
  WidgetsFlutterBinding.ensureInitialized();
  DarkThemeProvider darkThemeProvider = DarkThemeProvider();
  await Firebase.initializeApp();
  UserModel userModel = UserModel();
  ChatService chatService = ChatService(socketService, userModel);
  GameService gameService = GameService(socketService, userModel);
  CartModel cartModel = CartModel();

  runApp(MultiProvider(providers: [
    Provider<SocketService>(create: (context) => socketService),
    ChangeNotifierProvider<ChatService>(create: (context) => chatService),
    ChangeNotifierProvider<RoomService>(
        create: (context) => RoomService(socketService)),
    ChangeNotifierProvider<UserModel>(create: (context) => userModel),
    ChangeNotifierProvider<GameService>(create: (context) => gameService),
    ChangeNotifierProvider<CartModel>(create: (context) => cartModel),
    ChangeNotifierProvider<SoundService>(
        create: (context) => SoundService(true)),
    Provider<AuthService>(create: (context) => AuthService()),
    ChangeNotifierProvider<DarkThemeProvider>(
        create: (context) => darkThemeProvider),
    ChangeNotifierProvider<FriendsService>(
        create: (context) => FriendsService(socketService)),
    Provider(create: (context) => CatalogModel()),
    ChangeNotifierProxyProvider<CatalogModel, CartModel>(
      create: (context) => CartModel(),
      update: (context, catalog, cart) {
        if (cart == null) throw ArgumentError.notNull('cart');
        cart.catalog = catalog;
        return cart;
      },
    ),
  ], child: LocalizedApp(delegate, const MyApp())));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    var localizationDelegate = LocalizedApp.of(context).delegate;
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeRight,
      // DeviceOrientation.landscapeLeft,
    ]);

    return GetMaterialApp(
      theme: Styles.themeData(
        // Provider.of<DarkThemeProvider>(context, listen: true).theme,
        Provider.of<UserModel>(context, listen: true).preferences.theme,
        context,
      ),
      localizationsDelegates: [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        localizationDelegate
      ],
      supportedLocales: localizationDelegate.supportedLocales,
      locale: localizationDelegate.currentLocale,
      home: const LoginScreen(),
      initialRoute: '/login',
      routes: {
        '/login': (context) => const LoginScreen(),
        '/signUp': (context) => const SignUpScreen(),
        '/welcomePage': (context) => const HomeScreen(),
        // '/cart': (context) => const MyCart(),
      },
    );
  }
}
