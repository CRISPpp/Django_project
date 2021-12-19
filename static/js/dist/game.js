class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac_game_menu">
    <div class="ac_game_menu_field">
        <div class="ac_game_menu_field_item ac_game_menu_field_item_single_mode">
            单人模式
        </div>
        <br>
        <div class="ac_game_menu_field_item ac_game_menu_field_item_multi_mode">
            多人模式
        </div>
        <br>
        <div class="ac_game_menu_field_item ac_game_menu_field_item_settings">
            设置
        </div>
    </div>
</div>
`);
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac_game_menu_field_item_single_mode');
        this.$multi_mode = this.$menu.find('.ac_game_menu_field_item_multi_mode');
        this.$settings = this.$menu.find('.ac_game_menu_field_item_settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
        });
    }

    show() {  // 显示menu界面
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }
}

let AC_GAME_OBJECTS = [];
class AcGameObject{
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.has_called_start = false;//标记start有没有被执行
        this.timedelta = 0;//距离上一帧的时间ms， 有的浏览器调用requestAnimationFrame没有一秒60次
    }

    start(){// 第一帧
        
    }

    update(){//每帧

    }
    
    on_destroy(){//operation before destroy

    }

    destroy(){
        this.on_destroy();

        for(let i = 0; i < AC_GAME_OBJECTS.length; i ++){
            if(AC_GAME_OBJECTS[i] === this){
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}


let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp){
    for(let i = 0; i < AC_GAME_OBJECTS.length; i ++){
        let obj = AC_GAME_OBJECTS[i];
        if(!obj.has_called_start){
            obj.start();
            obj.has_called_start = true;
        }
        else{
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(AC_GAME_ANIMATION);//递归执行
}

requestAnimationFrame(AC_GAME_ANIMATION); //每秒执行60次
class GameMap extends AcGameObject{
    constructor(playground){
        console.log("game_map");
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);//js提供的画布渲染工具
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }


    start(){

    }


    update(){
        this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(255,192,203,0.1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

}
//粒子效果
class Particle extends AcGameObject{
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this. y = y;
        this.radius = radius;
        this.vx = vx;
        this. vy = vy;
        this.color = color;
        this.move_length = move_length;
        this.speed = speed;
        this.friction = 0.9;
        this.eps = 0.1;
    }
    start(){

    }

    update(){
        if(this.speed < this.eps || this.move_length < this.eps){
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class Player extends AcGameObject {
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
class FireBall extends AcGameObject{
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage){
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.1;
    }

    start(){

    }

    update(){
        console.log(this.move_length);
        if(this.move_length < this.eps){
            this.destroy();
            return false;
        }
        
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved; 

        //碰撞检测
        for(let i = 0; i < this.playground.players.length; i++){
            let player = this.playground.players[i];
            if(this.player !== player && this.is_collision(player)){
                this.attack(player);
            }
        }

        this.render();
    }

    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    //圆是否相交
    is_collision(player){
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if(distance < this.radius + player.radius) return true;
        return false;
    }

    //打击
    attack(player){
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destroy();
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class AcGamePlayground{
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        this.hide();
      

        this.start();
    }
    
    get_random_color(){
        let colors = ["blue", "red", "gret", "green", "purple", "yellow"];
        return colors[Math.floor(Math.random()*6)];
    }

    start() {
        
    }

    show(){
      this.$playground.show();
      this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        
        this.players.push(new Player(this, this.width/2, this.height/2, this.height*0.05, "black", this.height*0.15, true));

        for(let i = 0; i < 5; i++){
            this.players.push(new Player(this, this.width/2, this.height/2, this.height*0.05, this.get_random_color(), this.height*0.15, false));
        }
    }

    hide(){
        this.$playground.hide();
    }
} 
export class AcGame {
    constructor(id){
        this.id = id;
        
        this.$ac_game = $('#' + id);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        this.start();
    }

    start() {

    }
}
