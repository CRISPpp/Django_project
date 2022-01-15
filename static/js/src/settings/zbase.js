class Settings{
    constructor(root){
        this.root = root;
        this.platform = "WEB";
        if(this.root.AcWingOs) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";

        this.$settings = $(`
        <div class="ac_game_settings">
            <div class="ac_game_settings_login">
                <div class="ac_game_settings_title">
                    登录
                </div>
                <div class="ac_game_settings_username">
                    <div class="ac_game_settings_item">
                        <input type="text" placeholder="用户名">
                    </div>
                </div>
                <div class="ac_game_settings_password">
                    <div class="ac_game_settings_item">
                    <input type="password" placeholder="密码">
                    </div>
                </div>
                <div class="ac_game_settings_submit">
                    <div class="ac_game_settings_item">
                        <button>登录</button>
                    </div>
                </div>
                <div class="ac_game_settings_error_messages">
                </div>
                <div class="ac_game_settings_option">
                    注册
                </div>
                <br>
                <div class="ac_game_settings_acwing">
                    <img width="30" src="https://cdn.acwing.com/media/article/image/2021/11/18/1_ea3d5e7448-logo64x64_2.png">
                    
                    <br>
                    <br>
                    <div>
                        一键登录
                    </div>
                </div>
            </div>

            <div class="ac_game_settings_register">
             <div class="ac_game_settings_title">
                    注册
                </div>
                <div class="ac_game_settings_username">
                    <div class="ac_game_settings_item">
                        <input type="text" placeholder="用户名">
                    </div>
                </div>
                <div class="ac_game_settings_password ac_game_password_first">
                    <div class="ac_game_settings_item">
                    <input type="password" placeholder="密码">
                    </div>
                </div>
                 <div class="ac_game_settings_password ac_game_password_second">
                    <div class="ac_game_settings_item">
                    <input type="password" placeholder="确认密码">
                    </div>
                </div>
                <div class="ac_game_settings_submit">
                    <div class="ac_game_settings_item">
                        <button>注册</button>
                    </div>
                </div>
                <div class="ac_game_settings_error_messages">
                </div>
                <div class="ac_game_settings_option">
                    登录
                </div>
                <br>
                <div class="ac_game_settings_acwing">
                    <img width="30" src="https://cdn.acwing.com/media/article/image/2021/11/18/1_ea3d5e7448-logo64x64_2.png">
                    
                    <br>
                    <br>
                    <div>
                        一键登录
                    </div>
                </div>
            </div>
        </div>
        `);
        this.$login = this.$settings.find(".ac_game_settings_login");
        this.$login_username = this.$login.find(".ac_game_settings_username input");//> 隔开表示同级，没有表示在里面找
        this.$login_password = this.$login.find(".ac_game_settings_password input");
        this.$login_submit = this.$login.find(".ac_game_settings_submit button");
        this.$login_error_messages = this.$login.find(".ac_game_settings_error_messages");
        this.$login_register = this.$login.find(".ac_game_settings_option");
        this.$login.hide();
        this.$register = this.$settings.find(".ac_game_settings_register");
        this.$register_username = this.$register.find(".ac_game_settings_username input");//> 隔开表示同级，没有表示在里面找
        this.$register_password = this.$register.find(".ac_game_password_first input");
        this.$register_password_confirm = this.$register.find(".ac_game_password_second input");
        this.$register_submit = this.$register.find(".ac_game_settings_submit button");
        this.$register_error_messages = this.$register.find(".ac_game_settings_error_messages");
        this.$register_login = this.$register.find(".ac_game_settings_option");
        this.$register.hide();

        this.$acwing_login = this.$settings.find('.ac_game_settings_acwing img')

        this.root.$ac_game.append(this.$settings);
        this.start();
    }

    start(){
        this.getinfo();
        this.add_listening_events();
    }

    add_listening_events(){
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();

        this.$acwing_login.click(function(){
            outer.acwing_login();
        });
    }

    acwing_login(){
        $.ajax({
            url:"https://www.crisp.plus/settings/crispplus/web/apply_code/",
            type: "GET",
            success: function(resp){
                if(resp.result === "success"){
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }

    add_listening_events_login(){
        let outer = this;
        this.$login_register.click(function(){
            outer.register();
        });
        this.$login_submit.click(function(){
            outer.login_on_remote();
        });
    }
    add_listening_events_register(){
        let outer = this;
        this.$register_login.click(function(){
            outer.login();
        });
        this.$register_submit.click(function(){
            outer.register_on_remote();
        });
    }

    register(){//注册
        this.$login.hide();
        this.$register.show();
    }
    register_on_remote(){//远程注册
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_messages.empty();

        $.ajax({
            url:"https://www.crisp.plus/settings/register/",
            type:"GET",
            data:{
                username:username,
                password:password,
                password_confirm:password_confirm,
            },
            success: function(resp){
                if(resp.result === "success"){
                    location.reload();
                }
                else{
                    outer.$register_error_messages.html(resp.result);
                }
            }
        });
    }

    login(){
        this.$register.hide();
        this.$login.show();
    }
    login_on_remote(){//远程登录
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_messages.empty();

        $.ajax({
            url: "https://www.crisp.plus/settings/login/",
            type: "GET",
            data:{
                username:username,
                password:password,
            },
            success: function(resp){
                if(resp.result === "success"){
                    location.reload();
                }
                else{
                    outer.$login_error_messages.html(resp.result);
                }
            }
        });
    }
    logout_on_remote(){//远程登出
        if(this.platform === "ACAPP") return false;
        $.ajax({
            url:"https://www.crisp.plus/settings/logout/",
            type: "GET",
            success: function(resp){
                if(resp.result === "success"){
                    location.reload();
                }
            }
        });
    }

    //从服务端获取信息
    getinfo(){
        let outer = this;
        $.ajax({
            url: "https://www.crisp.plus/settings/getinfo/",
            type:"GET",
            data:{
                platform: outer.platform,
            },
            success: function(resp) {
                console.log(resp);
                if(resp.result === "success"){
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                }
                else{
                    outer.login();
                }
            }
        });
    }

    hide(){
        this.$settings.hide();
    }
    show(){
        this.$settings.show();
    }
}