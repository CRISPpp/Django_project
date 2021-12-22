from django.contrib import admin
from game.models.player.player import Player
# Register your models here.

admin.site.register(Player)

#更改完后要python3 manage.py makemigrationus, python3 manage.py migrate