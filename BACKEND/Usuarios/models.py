from django.db import models




class Usuario(models.Model):
    Nombre = models.CharField(max_length=100)
    NombreUsuario = models.CharField(max_length=50, unique=True)
    Password = models.CharField(max_length=128)
    Telefono = models.CharField(max_length=20, blank=True)
    Email = models.EmailField(unique=True)

    def __str__(self):
        return self.NombreUsuario