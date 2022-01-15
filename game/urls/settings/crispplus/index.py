from django.urls import path
from game.views.settings.crispplus.web.apply_code import apply_code
from game.views.settings.crispplus.web.receive_code import receive_code

urlpatterns = [
    path("web/apply_code/", apply_code, name="settings_crispplus_web_apply_code"),
    path("web/receive_code/", receive_code, name="settings_crispplus_web_receive_code"),
]