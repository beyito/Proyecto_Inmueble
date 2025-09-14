import 'package:movil_inmobiliaria/pages/home_page.dart';
import 'package:movil_inmobiliaria/views/login/login_page.dart';
import 'package:movil_inmobiliaria/views/usuario/perfil_view.dart';
import 'package:go_router/go_router.dart';
import 'package:movil_inmobiliaria/views/usuario/recuperacionPassword_view.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:movil_inmobiliaria/views/usuario/registerAgente_view.dart';
import 'package:movil_inmobiliaria/views/usuario/registerCliente_view.dart';

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
        GoRoute(
          path: 'perfil',
          name: PerfilView.name,
          builder: (context, state) => const PerfilView(),
        ),
      ],
    ),
    GoRoute(
      path: '/login',
      name: LoginPage.name,
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: '/register',
      name: RegisterClienteView.name,
      builder: (context, state) =>
          const RegisterClienteView(), // 👈 tu pantalla de registro de usuarios
    ),
    GoRoute(
      path: '/agente',
      name: RegisterAgenteView.name,
      builder: (context, state) =>
          const RegisterAgenteView(), // 👈 pantalla de registro de agentes
    ),
    GoRoute(
      path: '/recuperar-password',
      name: RecuperacionPasswordView.name,
      builder: (context, state) =>
          const RecuperacionPasswordView(), // 👈 pantalla de recuperacion contraseña
    ),
    GoRoute(path: '/', redirect: (_, __) => '/home/0'),
  ],
  redirect: (context, state) async {
    final loggedIn = await isLoggedIn();
    final location = state.location.toString();

    final loggingIn = location == '/login';
    final registering = location == '/register' || location == '/agente';
    final recovering = location == '/recuperar-password';

    if (!loggedIn && !(loggingIn || registering || recovering)) {
      return '/login';
    }

    if (loggedIn && (loggingIn || registering || recovering)) {
      return '/home/0';
    }

    return null;
  },
);
