from django.http import HttpResponse

def index(request):
    line1 = '<h1 style="text-align: center">中二标题</h1>'
    line2 = '<img src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.pianshen.com%2Fimages%2F137%2Fe367a24647e7a6fd70a6848cb5ee0839.png&refer=http%3A%2F%2Fwww.pianshen.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1641800920&t=b9913b7053450646a123579b2b1b61b4", width=1750>'
    return HttpResponse(line1 + line2)
