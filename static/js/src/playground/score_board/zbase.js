class ScoreBoard extends AcGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;

        this.state = 'null';
        this.win_img = new Image();
        this.win_img.src = "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Ftx-free-imgs.acfun.cn%2Fcontent%2F2020_2_5%2F1.5808661671379938E9.jpeg%3Fimageslim&refer=http%3A%2F%2Ftx-free-imgs.acfun.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1648137222&t=5865e64b6b78c8bc5c38e278edfa7b56";
        this.lose_img = new Image();
        this.lose_img.src = "https://img2.baidu.com/it/u=1151081893,2321896078&fm=253&fmt=auto&app=138&f=JPEG?w=887&h=500" ;

    }
    start(){

    }

    add_listening_events(){
        let outer = this;
        let $canvas = this.playground.game_map.$canvas;

        $canvas.on(`click`, function(){
            outer.playground.hide();
            outer.playground.root.menu.show();
            location.reload();
        });
    }

    win(){
        this.state = "win";
        let outer = this;
        setTimeout(function(){
            outer.add_listening_events();
        }, 1000);
    }
    lose(){
        this.state = "lose";
        let outer = this;
        setTimeout(function(){
            outer.add_listening_events();
        }, 1000);
    }
    late_update(){
        this.render();   
    }
    render(){
        let len = this.playground.height/2;
        if(this.state === "win"){
            this.ctx.drawImage(this.win_img, this.playground.width/2 - len/2*1.8 , this.playground.height/2 - len/2*1.8, len*1.8, len*1.8);
        }
        else if(this.state === "lose"){
            this.ctx.drawImage(this.lose_img, this.playground.width/2 - len/2*1.8 , this.playground.height/2 - len/2*1.8, len*1.8, len*1.8);
        }
    }
}