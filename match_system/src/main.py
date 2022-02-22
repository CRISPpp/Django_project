#! /usr/bin/env python3

import glob
import sys
sys.path.insert(0, glob.glob('../../')[0])#加这个才能importdjango原项目的包

from match_server.match_service import Match

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from queue import Queue #一个安全队列
from time import sleep
from threading import Thread

from acapp.asgi import channel_layer
from asgiref.sync import async_to_sync#将串行变成并行
from django.core.cache import cache

queue = Queue() #消息队列

class Player:
    #和之前cpp写的player一致
    def __init__(self, score, uuid, username, photo, channel_name):
        self.score = score
        self.uuid = uuid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        self.waiting_time = 0



class MatchHandler:
    def add_player(self, score, uuid, username, photo, channel_name):
        player = Player(score, uuid, username, photo, channel_name)
        queue.put(player)
        return 0 #不返回0会出现internal error

class Pool:
    def __init__(self):
        self.players = []
    def add_player(self, player):
        print("add player: %s %d" % (player.username, player.score))
        self.players.append(player)
    def check_match(self, a, b):
        #if a.username == b.username:
        #    return false
        dt = abs(a.score - b.score)
        a_limit = a.waiting_time * 50
        b_limit = b.waiting_time * 50
        return dt <= a_limit and dt <= b_limit
    def match_success(self, pl):
        print("match success: %s %s" % (pl[0].username, pl[1].username))
        players = []
        room_name = "room-%s-%s" % (pl[0].uuid, pl[1].uuid)
        for p in pl:
            async_to_sync(channel_layer.group_add)(room_name, p.channel_name)
            players.append({
                'uuid': p.uuid,
                'username': p.username,
                'photo': p.photo,
                'hp': 100,
            })
        
        cache.set(room_name, players, 3600)

        for p in pl:
            async_to_sync(channel_layer.group_send)(
                room_name,
                {
                    'type': "group_send_event",
                    'event': "create_player",
                    'uuid': p.uuid,
                    'username': p.username,
                    'photo': p.photo,
                }
            )

    def increase_waiting_time(self):
        for player in self.players:
            player.waiting_time += 1

    def match(self):
        while len(self.players) >= 2:
            self.players = sorted(self.players, key=lambda p: p.score)
            flag = False
            for i in range(len(self.players) - 1):
                a = self.players[i]
                b = self.players[i + 1]
                if self.check_match(a, b):
                    self.match_success([a, b])
                    self.players = self.players[:i] + self.players[i + 2:] #去除匹配成功的
                    flag = True
                    break
            if not flag:
                break
            

        self.increase_waiting_time()
        

def get_player_from_queue():
    try:
        return queue.get_nowait()#没有元素会抛出异常
    except:
        return None

def worker():
    pool = Pool()
    while True:
        player = get_player_from_queue()
        if player:
            pool.add_player(player)
        else:
            pool.match()
            sleep(1)#每一秒匹配一次


if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()


    # You could do one of these for a multithreaded server
    #第一个server：每来一个请求开一个线程处理，并行度最高
    server = TServer.TThreadedServer(processor, transport, tfactory, pfactory)
    #匹配池并发处理，超过限制会阻塞，相当于第一个的限制版
    # server = TServer.TThreadPoolServer(
    #    processor, transport, tfactory, pfactory)
    Thread(target=worker, daemon=True).start()#daemon=True表示杀掉主进程也关闭这个线程
    print('Starting the server...')
    server.serve()

if __name__ == '__main__':
    main()