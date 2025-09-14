# usuario/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminRole(BasePermission):
    """Permite sólo a usuarios con rol 'Administrador'."""
    def has_permission(self, request, view):
        u = getattr(request, "user", None)
        return bool(u and u.is_authenticated and hasattr(u, "es_admin") and u.es_admin())

class IsSuperUser(BasePermission):
    """Permite sólo a superusers (Django). Útil para elevar flags."""
    def has_permission(self, request, view):
        u = getattr(request, "user", None)
        return bool(u and u.is_authenticated and u.is_superuser)

class IsAdminOrReadOnly(BasePermission):
    """Admin escribe; los demás solo GET/HEAD/OPTIONS."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        u = getattr(request, "user", None)
        return bool(u and u.is_authenticated and hasattr(u, "es_admin") and u.es_admin())
