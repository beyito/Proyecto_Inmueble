import 'package:flutter/material.dart';
import 'package:movil_inmobiliaria/shared/custom_appbar.dart';

import '../shared/custom_bottom_navigation.dart';
import '../views/home_view.dart';

class HomePage extends StatelessWidget {
  static const name = 'home-screen';
  final int pageIndex;
  const HomePage({super.key, required this.pageIndex});

  final viewRoutes = const <Widget>[
    HomeView(), //Representa al /home/0, ya que está en el index 0
    SizedBox(
      child: Text("Categorias"),
    ), //<-- Categories View. Podemos colocar un Widget como HomeView
    // UsuariosView(), //<-- Usuarios View
  ];
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppbar(),
      body: IndexedStack(index: pageIndex, children: viewRoutes),
      bottomNavigationBar: CustomBottomNavigation(
        currentBottomIndex: pageIndex,
      ),
    );
  }
}
