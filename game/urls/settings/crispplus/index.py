from django.urls import path
from game.views.settings.crispplus.web.apply_code import apply_code as web_apply_code
from game.views.settings.crispplus.web.receive_code import receive_code as web_receive_code
from game.views.settings.crispplus.acapp.apply_code import apply_code as acapp_apply_code
from game.views.settings.crispplus.acapp.receive_code import receive_code as acapp_receive_code
from game.views.settings.crispplus.qq.apply_code import apply_code as qq_apply_code
from game.views.settings.crispplus.qq.receive_code import receive_code as qq_receive_code
urlpatterns = [
    path("web/apply_code/", web_apply_code, name="settings_crispplus_web_apply_code"),
    path("web/receive_code/", web_receive_code, name="settings_crispplus_web_receive_code"),
    path("acapp/apply_code/", acapp_apply_code, name="settings_crispplus_acapp_apply_code"),
    path("acapp/receive_code/", acapp_receive_code, name="settings_crispplus_acapp_receive_code"),
    path("qq/apply_code/", qq_apply_code, name="settings_crispplus_qq_apply_code"),
    path("qq/receive_code/", qq_receive_code, name="settings_crispplus_qq_receive_code"),
]