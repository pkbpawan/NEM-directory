(function ($) {


    Acme.mailChimp = function(template, parent, layouts) {
        this.template = template;
        this.parentCont = parent;
        this.layouts = layouts;
        this.parent = Acme.modal.prototype;
    };
    Acme.mailChimp.prototype = new Acme.modal();
    Acme.mailChimp.constructor = Acme.mailChimp;
    
    
    Acme.mailChimp.prototype.handle = function(e) {
        var $elem = this.parent.handle.call(this, e);
        if ( $elem.is('a') ) {
    
            if ($elem.hasClass('close')) {
    
                e.preventDefault();
                $('body').removeClass("active");
                this.closeWindow();
            }
        }
        if ($elem.hasClass('button')) {
    
    
            if ($elem.hasClass('close') || $elem.hasClass('j-close-button')) {
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
        "mailchimp"         : 'mailChimpSignup'
    
    }

    var mailchimpLink = '//not-loaded';
    var mailChimpTitle = 'Please configure your mailchimp';
    var mailChimpDescription = 'in the site config';
    var mailChimpUuid = 'unset';
    var mailChimpLid = 'unset';

    Acme.mailchimpView = new Acme.mailChimp('modal', 'mailchimp-modal', layouts);

    Acme.server.fetch(_appJsConfig.appHostName + '/api/theme/get-config')
        .done(function(r) {
            
            var data = r.data['mailchimp'];
            //console.log(data);
            if (data) {
                mailchimpLink = data.url;
                mailChimpTitle = data.title;
                mailChimpDescription = data.description;
                mailChimpUuid = data.uuid;
                mailChimpLid = data.lid;
                mailchimpAfterTitle = data.after_title;
                mailchimpAfterDesc = data.after_description;
                mailchimpAudience = data.audience;
                mailchimpTags = "";
                if(typeof data.tags !== "undefined" && data.tags !=="") {
                    mailchimpTags = data.tags;
                }
            }
            $('.j-insider-signup').on('click', function() {
                Acme.mailchimpView.render("mailchimp", "Become a Forty South Insider", {mctitle: mailChimpTitle, mcdescription: mailChimpDescription});
                $('#j-insider-subscribe').click(function(){
                    var errorText = '';
                    if ( $('#mce-FNAME').val() == '' ) {
                        errorText += "First name cannot be empty. <br />";
                       
                    }
                    if ( $('#mce-LNAME').val() == '' ) {
                        errorText += "Last name cannot be empty.  <br />";
                       
                    }
            
                    if ($('#mce-EMAIL').val() == '' ) {
                        errorText += "Email cannot be empty. ";
                        
                    }

                    $("#mailchimp-modal__errortext").html(errorText);
                    console.log(errorText);
                    if (!errorText) {
                        $("#mailchimp-modal__errortext").html('');
                        console.log('subscribing');
                        var subscribeData = {
                            "EMAIL":  $('#mce-EMAIL').val(),
                            "FNAME":   $('#mce-FNAME').val(),
                            "LNAME":   $('#mce-LNAME').val(),
                            "u": mailChimpUuid,
                            "id": mailChimpLid,
                            "tags": mailchimpTags
                        };
                
                        if (mailchimpAudience != ''){
                            doSubscribe = true;
                            subscribeData[mailchimpAudience] = 1;
                        };

                        // "group[7191][1]"    Wangaratta Chronicle
                        // "group[7191][2]"    Euroa Gazette
                        // "group[7191][4]"    Mansfield Courier
                        // "group[7191][8]"    Alpine Observer Myrtleford Times
                        // "group[7191][16]"   Ovens and Murray Advertiser
                        // "group[7191][32]"   North East Living Magazine
                        // "group[7191][64]"   Farmer News
                        // "group[7191][128]"  North East Tourist News
                        // "group[7191][256]"  North East Kids
                        // "group[7191][512]"  Falls Creek News
                        // "group[7191][1024]" Mt Buller News
                        // "group[7191][2048]" Mt Hotham News
                        
                
                        
                        Acme.server.create(mailchimpLink, subscribeData)
                        .then(function(r) {
                            console.log(r);
                            
                        });

                        $('.mailchimp-modal__title').html(mailchimpAfterTitle);
                        $('.mailchimp-modal__description').html(mailchimpAfterDesc);
                        $('#j-insider-subscribe').toggleClass('d-none');
                        $('#j-insider-close').toggleClass('d-none');
                        $('.mailchimp-modal__inputs>input').toggleClass('d-none');

                    }
            
                });
            });
        }).fail(function(r) {
            console.log(r);
        });
    
    
    
    
    
    
    
    
    // $('.j-insider-signup').on('click', function() {
    //     window.dojoRequire(["mojo/signup-forms/Loader"], function(L) { L.start({"baseUrl":"mc.us18.list-manage.com","uuid":"7ca16e173650b89f4d8302a86","lid":"9e8e5c87da","uniqueMethods":true}) });
    // });
    
    // $('a.j-register').on('click', function(e) {
    //     e.preventDefault();
    //     Acme.SigninView.render("register", "Register your interest");
    // });
    
    
    
    
    }(jQuery));