import 'package:movil_inmobiliaria/pages/home_page.dart';
import 'package:movil_inmobiliaria/views/login/login_page.dart';
import 'package:movil_inmobiliaria/views/usuario/perfil_view.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Tu función de verificación
Future<bool> isLoggedIn() async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');
  return token != null && token.isNotEmpty;
}

final appRouter = GoRouter(
  initialLocation: '/home/0',
  routes: [
    GoRoute(
      path: '/home/:page',
      name: HomePage.name,
      builder: (context, state) {
        final pageIndex = int.parse(state.pathParameters['page'] ?? '0');
        return HomePage(pageIndex: pageIndex);
      },
      routes: [
        // Son sub rutas dentro de home/:page. Osea /home/0/perfil
        GoRoute(
          path: 'perfil',
          name: PerfilView.name,
          builder: (context, state) {
            return PerfilView();
          },
        ),
        // GoRoute( // EJEMPLO PARA RUTA CON UN PARAMETRO. PARA ACCEDER A ÉL: context.go('/home/0/miruta/123');
        //   path: 'miruta/:id',
        //   name: MiWidgetScreen.name,
        //   builder: (context, state) {
        //     final valueID = state.pathParameters['id'] ?? 'no-id'; // id: representa el nombre de la variable, puede ser int, str.
        //La recuperamos para enviarselo al MiWidgetScreen que espera un valor de parámetro
        //     return MiWidgetScreen(nombreDelParametro: valueID); //
        //   },
        // ),
      ],
    ),
    GoRoute(
      //Ruta raíz, fuera del dominio de /home. Osea /login
      path: '/login',
      name: LoginPage.name,
      builder: (context, state) => LoginPage(),
      routes: [], //No tendrá sub rutas
    ),
    GoRoute(path: '/', redirect: (_, __) => '/home/0'),
  ],
  redirect: (context, state) async {
    final loggedIn = await isLoggedIn();
    final loggingIn = state.location.toString() == '/login';

    // Si no está logueado y NO está en login, lo mandamos a login
    if (!loggedIn && !loggingIn) {
      return '/login';
    }
    // Si ya está logueado e intenta ir a login, lo mandamos al home
    if (loggedIn && loggingIn) {
      return '/home/0';
    }
    // Si no, no redirige
    return null;
  },
);
