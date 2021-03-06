class MultiPlayerSocket{
    constructor(playground){
        this.playground = playground;

        this.ws = new WebSocket("wss://www.crisp.plus/wss/multiplayer/");

        this.start();
    }
    start(){
        this.receive();//从前端接受信息
    }

    receive(){
        let outer = this;
        this.ws.onmessage = function(e){
            let data = JSON.parse(e.data);

            if(data.uuid === outer.uuid) return false;
            let event = data.event;
            if(event === "create_player"){
                outer.receive_create_player(data.uuid, data.username, data.photo);
            }
            else if(event === 'move_to'){
                outer.receive_move_to(data.uuid, data.tx, data.ty);
            }
            else if(event === "shoot_fireball"){
                outer.receive_shoot_fireball(data.uuid, data.tx, data.ty, data.ball_uuid);
            }
            else if(event === "attack"){
                outer.receive_attack(data.uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            }
            else if(event === "flash"){
                outer.receive_flash(data.uuid, data.tx, data.ty);
            }
            else if(event === "chat"){
                outer.receive_chat(data.username, data.message);
            }
        };
    }

    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));   
    }
    receive_create_player(uuid, username, photo){
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );
        player.uuid = uuid;
        this.playground.players.push(player);
    }

    get_player(uuid){
        let players = this.playground.players;
        for (let i = 0; i < players.length; i ++){
            let player = players[i];
            if(player.uuid === uuid){
                return player;
            }
        }
        return null;
    }

    send_move_to(tx, ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty
        }));
    }
    receive_move_to(uuid, tx, ty){
        let player = this.get_player(uuid);
        if(player){
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid){
        //console.log("send_shoot");
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }
    receive_shoot_fireball(uuid, tx, ty, ball_uuid){
        //console.log("receive_shoot");
        let player = this.get_player(uuid);
        if(player){
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid){
        //在攻击后修改被攻击的位置，进行平衡
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }));
    }
    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid){
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if(attackee && attacker){
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }
    
    send_flash(tx, ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "flash",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }
    receive_flash(uuid, tx, ty){
        let player = this.get_player(uuid);
        player.flash(tx, ty);
    }

    send_chat(username, message){
        this.playground.players[0].chat_cd = 1;
        this.ws.send(JSON.stringify({
           'event': "chat",
           'username': username,
           'message': message, 
        }));
    }
    receive_chat(username, message){
        
        this.playground.chat_field.add_message(username, message);
    }
}