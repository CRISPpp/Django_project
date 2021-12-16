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
        this.ctx.fillStyle = "rgba(0,0,0)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

}
