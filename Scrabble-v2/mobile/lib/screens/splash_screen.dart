// S'inspirer de la logique ici pour l'implémentation du SplashScreen
// https://github.com/HayesGordon/chatter/blob/main/lib/screens/splash_screen.dart

// class SplashPage extends StatelessWidget {
//   int? duration = 0;
//   String? goToPage;

//   SplashPage({this.goToPage, this.duration});

//   @override
//   Widget build(BuildContext context) {
//     CategoryService catService =
//         Provider.of<CategoryService>(context, listen: false);

//     Future.delayed(Duration(seconds: this.duration!), () async {
//       // await for the Firebase initialization to occur
//       FirebaseApp app = await Firebase.initializeApp();

//       catService.getCategoriesCollectionFromFirebase().then((value) {
//         Utils.mainAppNav.currentState!.pushNamed(this.goToPage!);
//       });
//     });

//     return Material(
//         child: Container(
//             color: createMaterialColor(Color.fromRGBO(125, 175, 107, 1)),
//             alignment: Alignment.center,
//             child: Stack(
//               children: [
//                 Align(
//                   child: IconLogo(),
//                   alignment: Alignment.center,
//                 ),
//               ],
//             )));
//   }
// }
