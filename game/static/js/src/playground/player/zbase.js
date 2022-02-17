class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.username = username;
        this.photo = photo;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.eps = 0.01; //浮点运算，小于多少就算0
        this.friction = 0.9;//类似摩擦力递降的值
        this.spend_time = 0;//保护时间不然太容易死了233333
        this.cur_skill = null;//当前选的技能
        this.firevalls = [];

        if(this.character !== "robot"){
            this.img = new Image();
            this.img.src = this.photo;
        }
        if(this.character === "me"){
            this.fireball_cd = 3;//cd 3s
            this.fireball_img = new Image();
            //火球的图标
            this.fireball_img.src = "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fci.xiaohongshu.com%2F96d99959-2098-e9ea-54dd-b15f7f03d70e%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fci.xiaohongshu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1647626141&t=70ff659ff09e20bb33246252e7dda32f";

            this.flash_cd = 10;
            this.flash_img = new Image();
            this.flash_img.src = "https://img2.baidu.com/it/u=540894917,2727131209&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500";

            this.chat_cd = 1;
            this.chat_img = new Image();
            this.chat_img.src = "https://img2.baidu.com/it/u=500696291,3693960548&fm=253&fmt=auto&app=138&f=JPEG?w=260&h=260";

        }
    }

    start(){
        this.playground.player_count++;//每次调用start都++
        this.playground.notice_board.write("已接受:" + this.playground.player_count);

        if(this.playground.player_count >= 2){
            this.playground.state = "fighting";
            this.playground.notice_board.write("进行中,存活人数:" + this.playground.player_count);
        }

        if(this.character === "me"){
            this.add_listening_events();
        }else if(this.character === "robor"){
            let tx = Math.random() * this.playground.width/this.playground.scale;
            let ty = Math.random() * this.playground.height/this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){return false;});
        this.playground.game_map.$canvas.mousedown(function(e){
            if(outer.playground.state !== "fighting"){
                return false;
            }
            //1是左键，2是滚轮，3是右键
            //rect 是画布相对屏幕的量，left是（0,0）到左边界的距离，top是到上边界的距离
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if(e.which === 3){
                let tx = (e.clientX - rect.left)/outer.playground.scale ;
                let ty = (e.clientY - rect.top)/outer.playground.scale;
                outer.move_to(tx, ty);
                if(outer.playground.mode === "multi mode"){
                    outer.playground.mps.send_move_to(tx, ty);
                }
                let flag = true;
                //document.getElementById('button1').click();
                flag=false;
            }
            else if(e.which === 1){
                let flag = true;
                //document.getElementById('button1').click();
                flag=false;
                let tx = (e.clientX - rect.left)/outer.playground.scale;
                let ty = (e.clientY - rect.top)/outer.playground.scale;
                if(outer.cur_skill === "fireball"){
                    let fireball = outer.shoot_fireball(tx, ty);
                    if(outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                }
                else if(outer.cur_skill === "flash"){
                    outer.flash(tx, ty);
                    if(outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_flash(tx, ty);
                    }
                }

                outer.cur_skill = null;
            }
        });

        //获取键盘不能用canvas，无法聚焦
        this.playground.game_map.$canvas.keydown(function(e){

            if(e.which === 13){
                //enter
                if(outer.playground.mode === "multi mode"){
                    outer.playground.chat_field.show_input();
                    return false;
                }
            }
            else if(e.which === 27){
                //esc
                if(outer.playground.mode === "multi mode"){
                    outer.playground.chat_field.hide_input();
                    return false;
                }
            }

            if(outer.playground.state !== "fighting"){
                return true;
            }
            if(e.which === 81){
                //q
                if(outer.fireball_cd > outer.eps){
                    return true;
                }
                outer.cur_skill = "fireball";
                // let flag = true;
                // document.getElementById('button1').click();
                // flag=false;
                return false;
            }
            else if(e.which === 70){
                //f
                if(outer.flash_cd > outer.eps){
                    return true;
                }
                outer.cur_skill = "flash";
                return false;
            }
        });
    }

    flash(tx, ty){
        this.flash_cd = 10;
        this.x = tx;
        this.y = ty;
        this.move_length = 0;
    }

    shoot_fireball(tx, ty){
        let x = this.x, y = this.y;
        let radius =  0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1 ;
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color,speed, move_length,0.01);
        //new FireBall(this.playground, this, x, y, radius, vx, vy, color,speed, move_length,0);
        this.firevalls.push(fireball);
        this.fireball_cd = 3;
        return fireball;
    }

    destroy_fireball(uuid){
        for(let i = 0; i < this.firevalls.length; i++){
            let fireball = this.firevalls[i];
            if(fireball.uuid === uuid){
                fireball.destroy();
                break;
            }
        }
    }

    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty){
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }


    //被攻击到
    is_attacked(angle, damage){
        for(let i = 0; i < 20 + Math.random() * 10; i++){
            let x = this.x;
            let y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 30;
            let move_length = this.radius * Math.random() * 20;
            new Particle(this.playground, x,y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;
        if(this.radius < this.eps){
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.8;
    }

    receive_attack(x, y, angle, damage, ball_uuid, attacker){
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }

    update(){
        this.spend_time += this.timedelta / 1000;
        if(this.character === "me" && this.playground.mode === "multi mode"){
        this.chat_cd -= this.timedelta / 1000;
        this.chat_cd = Math.max(this.chat_cd, 0);
        this.playground.chat_field.chat_cd = this.chat_cd;
        }     
        if(this.character === "me" && this.playground.state === "fighting"){
            this.update_cd();
        }
        this.update_move();
        this.render();
    }
    update_cd(){
        this.fireball_cd -= this.timedelta / 1000;
        this.fireball_cd = Math.max(this.fireball_cd, 0);
        this.flash_cd -= this.timedelta / 1000;
        this.flash_cd = Math.max(this.flash_cd, 0);
    }

    update_move(){
        //负责更新玩家移动
        
        if(this.character === "robot" &&  this.spend_time > 4 &&  Math.random() < 1 / 300.0){
            let player = this.playground.players[Math.floor(Math.random()*this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.5;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.5;
            this.shoot_fireball(player.x, player.y);
        }

        if(this.damage_speed > this.eps){
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }
        else{
        if(this.move_length < this.eps){
            this.move_length = 0;
            this.vx = this.vy = 0;
            //AI的话
            if(this.character === "robot"){
                let tx = Math.random() * this.playground.width/this.playground.scale;
                let ty = Math.random() * this.playground.height/this.playground.scale;
                this.move_to(tx, ty);
            }
        }
        else{
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000); 
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
        }
    }
    }

    render(){
         if(this.playground.state === "fighting"){
            this.playground.notice_board.write("进行中,存活人数:" + this.playground.player_count);
        }
        if(this.playground.state === "over"){
            this.playground.notice_board.write("GOOD GAME");
        }
        let scale = this.playground.scale;
        if(this.character !== "robot"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius)*scale, (this.y - this.radius)*scale, this.radius * 2*scale, this.radius * 2 * scale);
            this.ctx.restore();
        }
        else{
            //画圆
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
        if(this.character === "me" && this.playground.mode === "multi mode"){
            this.render_chat_cd();
        }
        if(this.character === "me" && this.playground.state === "fighting"){
            this.render_fireball_cd();
            this.render_flash_cd();
        }
    }

    render_chat_cd(){
        let scale = this.playground.scale;
        let x = 1.7, y = 0.9 , r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.chat_img, (x - r)*scale, (y - r)*scale, r * 2*scale, r * 2 * scale);
        this.ctx.restore();
        
        //cd
        if(this.chat_cd > this.eps){
        this.ctx.beginPath();
        //画两条半径
        this.ctx.moveTo(x * scale, y * scale);
        this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * this.flash_cd / 10 - Math.PI / 2, false);
        this.ctx.lineTo(x * scale, y * scale);
        this.ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        this.ctx.fill();
        }
    }

    render_fireball_cd(){
        let scale = this.playground.scale;
        let x = 1.5, y = 0.9 , r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r)*scale, (y - r)*scale, r * 2*scale, r * 2 * scale);
        this.ctx.restore();
        
        //cd
        if(this.fireball_cd > this.eps){
        this.ctx.beginPath();
        //画两条半径
        this.ctx.moveTo(x * scale, y * scale);
        this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * this.fireball_cd / 3 - Math.PI / 2, false);
        this.ctx.lineTo(x * scale, y * scale);
        this.ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        this.ctx.fill();
        }
    }
    render_flash_cd(){
        let scale = this.playground.scale;
        let x = 1.6, y = 0.9 , r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.flash_img, (x - r)*scale, (y - r)*scale, r * 2*scale, r * 2 * scale);
        this.ctx.restore();
        
        //cd
        if(this.flash_cd > this.eps){
        this.ctx.beginPath();
        //画两条半径
        this.ctx.moveTo(x * scale, y * scale);
        this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * this.flash_cd / 10 - Math.PI / 2, false);
        this.ctx.lineTo(x * scale, y * scale);
        this.ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        this.ctx.fill();
        }
    }

    on_destroy(){
        if(this.character === "me"){
            this.playground.state = "over";
        }
        this.playground.player_count--;
        for(let i = 0; i < this.playground.players.length; i++){
            if(this.playground.players[i] === this){
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}
