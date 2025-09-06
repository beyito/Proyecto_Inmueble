
from django.contrib import admin
from django.urls import path
from Usuarios import views
urlpatterns = [
    path('admin/', admin.site.urls),

    path('login',views.login),
    path('register',views.register),
    path('profile',views.profile),
   
]

