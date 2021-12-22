from django.db import models
from django.contrib.auth.models import User

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)#删除model，user一起删掉
    photo = models.URLField(max_length=256, blank=True)#头像

    def __str__(self):
        return str(self.user)