class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1; //浮点运算，小于多少就算0
        this.friction = 0.9;//类似摩擦力递降的值
        this.spend_time = 0;//保护时间不然太容易死了233333
        this.cur_skill = null;//当前选的技能

    }

    start(){
        if(this.is_me){
            this.add_listening_events();
        }else{
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){return false;});
        this.playground.game_map.$canvas.mousedown(function(e){
            //1是左键，2是滚轮，3是右键
            //rect 是画布相对屏幕的量，left是（0,0）到左边界的距离，top是到上边界的距离
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if(e.which === 3){
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
                let flag = true;
                document.getElementById('button1').click();
                flag=false;
            }
            else if(e.which === 1){
                 let flag = true;
                 document.getElementById('button1').click();
                 flag=false;
                if(outer.cur_skill === "fireball"){
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                }

                outer.cur_skill = null;
            }
        });

        //获取键盘不能用canvas，无法聚焦
        $(window).keydown(function(e){
            if(e.which === 81){
                //q
                outer.cur_skill = "fireball";
                // let flag = true;
                // document.getElementById('button1').click();
                // flag=false;
                return false;
            }
        });
    }

    shoot_fireball(tx, ty){
        console.log("shoot");
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height ;
        //new FireBall(this.playground, this, x, y, radius, vx, vy, color,speed, move_length,this.playground.height*0.01);
        new FireBall(this.playground, this, x, y, radius, vx, vy, color,speed, move_length,0);
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
        if(this.radius < 10){
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        //this.speed *= 0.8;
    }

    update(){
        this.spend_time += this.timedelta / 1000;
        
        if(!this.is_me &&  this.spend_time > 4 &&  Math.random() < 1 / 300.0){
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
            if(!this.is_me){
                let tx = Math.random() * this.playground.width;
                let ty = Math.random() * this.playground.height;
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
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy(){
        for(let i = 0; i < this.playground.players.length; i++){
            if(this.playground.players[i] === this){
                this.playground.players.splice(i, 1);
            }
        }
    }
}