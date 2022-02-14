class AcGamePlayground{
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        this.hide();
        this.root.$ac_game.append(this.$playground);

        this.start();
    }
    
    get_random_color(){
        let colors = ["blue", "red", "gret", "green", "purple", "yellow"];
        return colors[Math.floor(Math.random()*6)];
    }

    start() {
        let outer = this;
        $(window).resize(function(){
            outer.resize();
        });//这个接口在窗口大小被用户调动时触发
    }

    resize(){
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);//16 : 9
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;//作为基准
        if(this.game_map) this.game_map.resize();
    }

    show(mode){
        let outer = this;
        this.$playground.show();
        
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.resize();
        this.players = [];
        
        this.players.push(new Player(this, this.width/2/this.scale, 0.5, 0.05, "black", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if(mode === "single mode"){//单人模式加机器人
            for(let i = 0; i < 5; i++){
                this.players.push(new Player(this, this.width/2/this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        }
        else if(mode === "multi mode"){
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid; 
            this.mps.ws.onopen = function(){
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }
    }

    hide(){
        this.$playground.hide();
    }
} 
