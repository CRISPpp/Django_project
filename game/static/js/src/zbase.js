export class AcGame {
    constructor(id, AcWingOS){
        this.id = id;
        this.$ac_game = $('#' + id);
        this.AcWingOS = AcWingOS;//AcWingOS 只有在acapp上调用才会传入
        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        this.start();
    }

    start() {

    }
}
