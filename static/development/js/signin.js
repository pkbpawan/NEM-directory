(function ($) {


Acme.Signin = function(template, parent, layouts) {
    this.template = template;
    this.parentCont = parent;
    this.layouts = layouts;
    this.parent = Acme.modal.prototype;
};
Acme.Signin.prototype = new Acme.modal();
Acme.Signin.constructor = Acme.Signin;

Acme.Signin.prototype.errorMsg = function(msg) {
    $('#login-error').removeClass('u-display-none');
};
Acme.Signin.prototype.handle = function(e) {
    var self = this;

    var $elem = this.parent.handle.call(this, e);
    if ( $elem.is('a') ) {

        if ($elem.hasClass('close')) {

            e.preventDefault();
            $('body').removeClass("active");
            this.closeWindow();
        }
    }
    if ($elem.is('button')) {

        $('#login-error').addClass('u-display-none');
        if ($elem.hasClass('j-signin')) {
            $elem.text('')
                 .addClass('spinner');
            e.preventDefault();
            var formData = {};

            $.each($('#loginForm').serializeArray(), function () {
                formData[this.name] = this.value.trim();
            });
            // rememberMe sets flag to store login for 30 days in cookie
            formData['rememberMe'] = 1;

            Acme.server.create(_appJsConfig.appHostName + '/api/auth/login', formData).done(function(r) {
                if (r.success === 1) {

                    // if password reset must return to home page, else 
                    // get an error when staying on auth endpoint.
                    if (window.location.pathname === "/auth/reset-thanks") {
                        window.location.replace(_appJsConfig.appHostName);
                        return;
                    }

                    window.location.reload();

                } else {
                    $elem.text("Sign in")
                         .removeClass('spinner');
                    self.errorMsg();
                }
            }).fail(function(r) { console.log(r);});
        }



        if ($elem.hasClass('j-forgot-email')) {
            e.preventDefault();
            var formData = {};
            $.each($('#forgotForm').serializeArray(), function () {
                formData[this.name] = this.value;
            });

            Acme.server.create(_appJsConfig.appHostName + '/api/auth/forgot-password', formData).done(function(r) {
                // if (r.success === 1) {
                //     location.reload();
                // } else {
                //     self.errorMsg();
                // }
                self.closeWindow();

            }).fail(function(r) { self.closeWindow();});
        }



        if ($elem.hasClass('close')) {
            $('body').removeClass("active");
            this.closeWindow();
        }
   

    }

    if ($elem.data('layout') != null) {
        var layout = $elem.data('layout');
        this.renderLayout(layout);

    }


};

var layouts = {
    "signin"         : 'signinFormTmpl',
    "register"       : 'registerTmpl',
    "forgot"         : 'forgotFormTmpl',
    "spinner"        : 'spinnerTmpl',
    "expired"        : 'expiredNotice',
    "userPlan"       : 'userPlanMessage',
    "userPlanChange" : 'userPlanOkCancel',
    "userDelete"     : 'listingDeleteTmpl',

}






$('#signinBtn, #articleSigninBtn, .j-signin').on('click', function() {
    loadSigninForm();
});

// $('#signinBtn, #articleSigninBtn').on('click', function() {
//     Acme.SigninView.render("signin", "Log in");
// });

var googleLogin = function(user) {
    var postData = {
        "user": JSON.stringify(user)
    };

    Acme.server.create('/auth/google-signin', postData ).done(function(r) {
        //console.log(r);
        if (r.success == 1) {
            location.reload()
            return;
        }
        Acme.SigninView.errorMsg();
    });
}

window.loadSigninForm = function() {
    Acme.SigninView = new Acme.Signin('modal', 'signin-modal', layouts);
    Acme.SigninView.render("signin", "Sign in");

    $('.js-passwordToggler').on('click',function() {
        if ($(this).prev('.js-passwordVisible').attr('type') == 'password') {
            $(this).prev('.js-passwordVisible').attr('type', 'text');
            $(this).addClass('active');
        } else {
            $(this).prev('.js-passwordVisible').attr('type', 'password');
            $(this).removeClass('active');
        }
    });




    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: window.client_id,
            callback: googleLogin
          });
          google.accounts.id.renderButton(
            document.getElementById("google_signin"),
            { 
                theme: "outline", 
                size: "large",
                width: 100
            }  // customization attributes
          );
    }
}









// $('a.j-register').on('click', function(e) {
//     e.preventDefault();
//     Acme.SigninView.render("register", "Register your interest");
// });




}(jQuery));