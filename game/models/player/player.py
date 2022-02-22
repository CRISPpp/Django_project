from django.db import models
from django.contrib.auth.models import User

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)#删除model，user一起删掉
    photo = models.URLField(max_length=256, blank=True)#头像
    openid = models.CharField(default="", max_length=50, blank=True, null=True)
    score = models.IntegerField(default = 1500)
    def __str__(self):
        return str(self.user)