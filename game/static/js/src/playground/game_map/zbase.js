class GameMap extends AcGameObject{
    constructor(playground){
        super();
        this.$music=$(`<audio src="https://www.crisp.plus/static/audio/bgm3.mp3" loop="loop" autoplay="autoplay">`);
        $("head").append(this.$music);
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);//js提供的画布渲染工具
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
        this.music_play();
    }
    music_play(){
        this.$music[0].play();
    }

    start(){

    }

    resize(){
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(255,192,203,1)";//下面两行能去除变化窗口的渐变效果
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update(){
        this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(255,192,203,0.1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

}
