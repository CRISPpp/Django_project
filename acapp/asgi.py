"""
ASGI config for acapp project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os
#下面这三行不写在这里会报错django.core.exceptions.ImproperlyConfigured: Requested setting INSTALLED_A) │essing settings.
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'acapp.settings')

django.setup()

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from game.routing import websocket_urlpatterns


from channels.layers import get_channel_layer
channel_layer = get_channel_layer()#让thrift进程调用wss的进程

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
})

