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

    create_uuid(){
        let res = "";
        for(let i = 0; i < 8; i++){
            let x = parseInt(Math.floor(Math.random() * 10));//parseInt(string, radix)将字符串转成int
            res += x;
        }
        return res;
    }

    start() {
        let outer = this;
        let uuid = this.create_uuid();
        $(window).on(`resize.${uuid}`,function(){
            outer.resize();
        });//这个接口在窗口大小被用户调动时触发
        if(this.root.AcWingOs){
            this.root.AcWingOs.api.window.on_close(function(){
                $(window).off(`resize.${uuid}`);
            });
        }
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
        this.state = "waiting"; //等待开始,人齐后变为fighting,死后更新为over
        this.notice_board = new NoticeBoard(this);
        this.score_board = new ScoreBoard(this);
        this.player_count = 0;
        

        this.resize();
        this.players = [];
        this.mode = mode; 
        this.players.push(new Player(this, this.width/2/this.scale, 0.5, 0.05, "black", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if(mode === "single mode"){//单人模式加机器人
            for(let i = 0; i < 5; i++){
                this.players.push(new Player(this, this.width/2/this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        }
        else if(mode === "multi mode"){
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid; 
            this.mps.ws.onopen = function(){
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }
    }

    hide(){
        while(this.players && this.players.length > 0){
            this.players[0].destroy();
        }
        if(this.game_map){
            this.game_map.destroy();
            this.game_map = null;
        }
        if(this.notice_board){
            this.notice_board.destroy();
            this.notice_board = null;
        }
        if(this.score_board){
            this.score_board.destroy();
            this.score_board = null;
        }
        this.$playground.empty();//清空所有html元素
        this.$playground.hide();
    }
} 
