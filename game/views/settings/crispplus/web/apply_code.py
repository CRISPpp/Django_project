from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache

def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    appid = "922" #我acwing的appid
    redirect_uri = quote("https://www.crisp.plus/settings/crispplus/web/receive_code/")
    scope = "userinfo"
    state = get_state()

    cache.set(state, True, 7200) #2小时有效期
    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"
    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state)

    })