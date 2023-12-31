
    
Acme.UserProfileController = function()
{
    this.csrfToken      = $('meta[name="csrf-token"]').attr("content");
    this.mailChimpUser  = false;
   

    this.events();
    this.pageEvents();
    this.listingEvents();
};



Acme.UserProfileController.prototype.deleteUser = function(e) {
   
    var user = $(e.target).closest('li');
    var userid = user.attr("id");

    var requestData = { 
        id: userid, 
        _csrf: this.csrfToken
    };


    return $.ajax({
        type: 'post',
        url: _appJsConfig.baseHttpPath + '/user/delete-managed-user',
        dataType: 'json',
        data: requestData,
        success: function (data, textStatus, jqXHR) {
            if (data.success == 1) {
                user.remove();
                $('#addManagedUser').removeClass('hidden');
                var usertxt = $('.profile-section__users-left').text();
                var usercount = usertxt.split(" ");
                var total = usercount[2];
                usercount = parseInt(usercount[0]);
                $('.profile-section__users-left').text((usercount - 1) + " of " + total + " used.");
            } else {
                var text = '';
                for (var key in data.error) {
                    text = text + data.error[key] + " ";
                } 
                $('#createUserErrorMessage').text(text);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('error', textStatus);
            $('#createUserErrorMessage').text(textStatus);
        },
    });
};
Acme.UserProfileController.prototype.renderCard = function(user, options )
{
    var cardClass = typeof options.cardClass !== 'undefined' ? options.cardClass : '';
    var type = typeof options.type !== 'undefined' ? options.type : '';
    var template = typeof options.template !== 'undefined' ? options.template : '';
    user['cardClass'] = cardClass;
    var template = (template) ? Acme.templates[template] : Acme.systemCardTemplate;
    userTemplate = Handlebars.compile(template);
    var template = userTemplate(user);
    return template;
};
Acme.UserProfileController.prototype.renderUser = function(parent, data, template) {

    var userTemp = template ? Handlebars.compile(template) : Handlebars.compile(Acme.templates.managed_user);
    if (data.constructor != Array) {
        data = [data];
    }
    var html = '';
    for (var i = 0; i < data.length; i++) {
        html += userTemp(data[i]);
    }
    parent.empty().append(html);
};

Acme.UserProfileController.prototype.render = function(data) 
{
    var self = this;
    var data = data.users.users || data.users;
    var users = [];
    for (var i=0; i< data.length; i++) {
        users.push({
            id: data[i].id, 
            email:  data[i].email, 
        });
    }
    self.renderUser(($('#managedUsers')), users, Acme.managed_user);
    self.events();
};

Acme.UserProfileController.prototype.search = function(params) 
{   
    var self = this;
    this.fetch(params, 'search-managed-users').done(function(data) {
        self.render(data);
    });
};

Acme.UserProfileController.prototype.fetchUsers = function(params) 
{   
    var self = this;
    var params = params || {};
    params['limit'] = 10;
    this.fetch(params, 'load-more-managed').done(function(data) {
        self.render(data);
    });
};

Acme.UserProfileController.prototype.fetch = function(params, url) 
{
    var url = _appJsConfig.baseHttpPath + '/api/user/'+ url;
    return Acme.server.fetch(url, params);
};



Acme.UserProfileController.prototype.events = function() 
{
    var self = this;


    // $('.j-edit').unbind().on('click', function(e) {

    //     var listelem = $(e.target).closest('li');
    //     var userid = listelem.attr("id");

    //     function getUserData(func) {
    //         return {
    //             firstname: listelem.find('.j-firstname')[func](), 
    //             lastname:  listelem.find('.j-lastname')[func](), 
    //             username:  listelem.find('.j-username')[func](), 
    //             useremail: listelem.find('.j-email')[func](),
    //         };
    //     };

    //     var data = getUserData("text");
    //     var userTemp = Handlebars.compile(Acme.templates.edit_user);
    //     var html = userTemp(data);
    //     listelem.empty().append(html);

    //     $('#cancelUserCreate').on('click', function(e) {
    //         self.renderUser(listelem, data);
    //         self.userEvents();
    //     });

    //     $('#saveUser').on('click', function(e) {
    //         console.log('save user 148');
    //         var requestData = getUserData("val");
    //         requestData.id = userid;
    //         requestData._csrf = this.csrfToken;
    //         $.ajax({
    //             type: 'post',
    //             url: _appJsConfig.baseHttpPath + '/user/edit-managed-profile',
    //             dataType: 'json',
    //             data: requestData,
    //             success: function (data, textStatus, jqXHR) {
    //                 if (data.success == 1) {
    //                     self.renderUser(listelem, requestData);
    //                     $('#addManagedUser').removeClass('hidden');
    //                     $('#createUserErrorMessage').text('');

    //                 } else {
    //                     var text = '';
    //                     for (var key in data.error) {
    //                         text = text + data.error[key] + " ";
    //                     } 
    //                     $('#createUserErrorMessage').text(text);
    //                 }
    //                 self.userEvents();
    //             },
    //             error: function (jqXHR, textStatus, errorThrown) {
    //                     $('#createUserErrorMessage').text(textStatus);
    //             },
    //         });        
    //     });
    // });  

    $('.j-delete').unbind().on('click', function(e) {
        Acme.SigninView.render("userDelete", "Are you sure you want to delete this user?")
            .done(function() {
                self.deleteUser(e);
            });
    });   
};




Acme.UserProfileController.prototype.pageEvents = function () 
{
    var self = this;

    $('#profile-form').submit( function(e) {
        e.preventDefault();

        // NOTE this form also uses validation from the stripe subscribe form
        // purely by accident as the event listeners in THAT form are generic.

        // Will need to separate if it becomes a problem but for now it works
        // The following stops submit and adds error text

        var errorText = '';

        if ( $('#first-name').val() == '' ) {
            errorText += "First name cannot be empty. <br />";
        }
        if ( $('#last-name').val() == '' ) {
            errorText += "Last name cannot be empty.  <br />";
        }

        if ($('#email').val() == '' ) {
            errorText += "Email cannot be empty. ";
        }

        if ($('#password').val() !== $('#verifypassword').val() ) {
            errorText += "Password and verify password fields do not match. ";
        }

        $("#account-form__errorText").html(errorText);
        $('#error-container').show();
        
        if (!errorText) {
            $(this).unbind('submit').submit()
        }
    });

    $('#message-close').on('click', function(e) {
        e.preventDefault();
        var parent = $(this).parent().remove();
    });

    $('#managed-user-search').on('submit', function(e) {
        console.log('searching');
        e.preventDefault();
        var search = {};
        $.each($(this).serializeArray(), function(i, field) {
            search[field.name] = field.value;
        });

        self.search(search);
        $('#user-search-submit').hide();
        $('#user-search-clear').show();

    });

    $('#user-search-clear').on('click', function(e) {
        e.preventDefault();
        self.fetchUsers();
        $('#managed-user-search-field').val('');
        $('#user-search-submit').show();
        $('#user-search-clear').hide();
    });



    $('#addManagedUser').on('click', function(e) {
        e.preventDefault()

        var userTemp = Handlebars.compile(Acme.templates.create_user);
        var data = {
            firstname: "First name", 
            lastname:  "Last name", 
            username:  "Username", 
            useremail: "Email",
        };

        // var html = '<li id="newUser" class="user-editor user-editor__add"><p class="text-button">Add User</p>' + userTemp(data) + '</li>';
        var html = userTemp(data);

        $('#createManagedUser').append(html);
        $('#newuserfirstname').focus();
        $('#addManagedUser').addClass('hidden');
        $('#nousers').addClass('hidden');

        $('#saveUser').on('click', function(e) {
            $('#userError').text("");

            var requestData = { 
                firstname: $('#newuserfirstname').val(), 
                lastname:  $('#newuserlastname').val(), 
                username:  $('#newuserusername').val(), 
                useremail: $('#newuseruseremail').val(),
                _csrf: this.csrfToken
            };
            
            var errorText = "";
            if (requestData.firstname === ""){
                errorText += "First name cannot be blank. ";
            }
            if (requestData.lastname === ""){
                errorText += "Last name cannot be blank. ";
            }
            if (requestData.username === ""){
                errorText += "Username cannot be blank. ";
            }
            if (requestData.useremail === ""){
                errorText += "Email cannot be blank. ";
            }
            if (errorText != "") {
                $('#userError').text(errorText);
                return;
            }
            
            
            $(this).addClass('spinner').addClass('c-button--spinner');
            // return;
            $.ajax({
                type: 'post',
                url: _appJsConfig.baseHttpPath + '/user/create-paywall-managed-user',
                dataType: 'json',
                data: requestData,
                success: function (data, textStatus, jqXHR) {

                    if (data.success == 1) {

                        location.reload(false);             
                    } else {
                        var text = '';
                        for (var key in data.error) {
                            text = text + data.error[key] + " ";
                        } 
                        $('#userError').text(text);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $('#user-editor-buttons').removeClass('spinner')
                                             .removeClass('c-button--spinner');
                    $('#userError').text(textStatus);
                },
            });        
        });

        $('#cancelUserCreate').on('click', function(e) {
            $('#newUser').remove();
            $('#addManagedUser').removeClass('hidden');
            $('#createUserErrorMessage').text('');
        });
    });



    $('#cancelAccount').on('click', function(e) {
        e.preventDefault();
        var listelem = $(e.target).closest('li');

        var status = 'cancelled';
        message = "Are you sure you want to cancel your plan?"
        if ($(e.target).text() == 'Restart Subscription') {
            message = "Do you want to reactivate your plan? You will be billed on the next payment date."
            status = 'paid'
        }
        var requestData = { 
            status: status, 
            _csrf: this.csrfToken, 
        };

        Acme.SigninView.render("userPlanChange", message)
            .done(function() {
                $('#dialog').parent().remove();
                
                $.ajax({
                    type: 'post',
                    url: _appJsConfig.baseHttpPath + '/user/paywall-account-status',
                    dataType: 'json',
                    data: requestData,
                    success: function (data, textStatus, jqXHR) {
                        if (data.success == 1) {
                            window.location.reload(false);             
                        } else {
                            var text = '';
                            for (var key in data.error) {
                                text = text + data.error[key] + " ";
                            } 
                            $('#createUserErrorMessage').text(text);
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(textStatus);
                        $('#createUserErrorMessage').text(textStatus);
                    },
                });        
            }); 
    });       


    $('.j-setplan').on('click', function(e) {
        e.stopPropagation();
        var newPlan = $(e.target);
        if (!newPlan.hasClass('j-setplan')) {
            newPlan = $(e.target.parentNode);
        }
        
        var currentPlan = $('#currentPlanStats');
        var cardSupplied     = currentPlan.data("cardsupplied");

        var currentUserCount = +currentPlan.data('currentusers');
        var oldcost          = +currentPlan.data('currentcost');
        var oldPlanPeriod    = +currentPlan.data('currentplanperiodcount');
        var expDate          =  currentPlan.data('expiry');
        var olddays          =  currentPlan.data('currentperiod');
        var oldPlanType      =  currentPlan.data('currenttype');

        var planusers        = +newPlan.data('planusercount');
        var newcost          = +newPlan.data('plancost');
        var newPlanPeriod    = +newPlan.data('planperiodcount');
        var newdays          =  newPlan.data('planperiod');
        var newPlanType      =  newPlan.data('plantype');

        
        if (currentUserCount > 0 && currentUserCount >= planusers) {
            Acme.SigninView.render("userPlan", "You have too many users to change to that plan.");
            return;
        }


        if (newdays == 'week')  {newdays = 7;}
        if (newdays == 'month') {newdays = 365/12;}
        if (newdays == 'year')  {newdays = 365;}
        if (olddays == 'week')  {olddays = 7;}
        if (olddays == 'month') {olddays = 365/12;}
        if (olddays == 'year')  {olddays = 365;}
        newdays = newdays * newPlanPeriod;
        olddays = olddays * oldPlanPeriod;
        var newplandailycost = newcost / newdays;
        var plandailycost = oldcost/olddays;
        var diffDays = moment(expDate).diff(moment(), 'days');
        // console.log(diffDays);

        var msg = "";
        var newCharge = 0;
        if (( newPlanType == 'article' && oldPlanType !== 'time') || ( newPlanType == 'time' && oldPlanType === 'article') ) {
            newCharge = newcost / 100;
        }

        if (oldPlanType === 'signup' ) {
            newCharge = newcost / 100;
        }
        
        if (oldPlanType === 'time' && newPlanType === 'time' && newcost < oldcost ) {
            newCharge = 0;
        }

        // more expensive time base plan changes require a charge that is the difference in cost between the two
        if (oldPlanType === 'time' && newPlanType === 'time' && diffDays > 0) {
            if ((newplandailycost-plandailycost) * diffDays >= 0) {
                newCharge = Math.round((( newplandailycost-plandailycost) * diffDays) / 100 );
            }
        }

        if (newCharge > 0) {
            msg = "This will cost $" + newCharge.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
        }

        if (cardSupplied === 'f' ) {
            msg = "Please add your card to the Credit Card Details section and click UPDATE, then select a new plan.";
            Acme.SigninView.render("userPlan", "This plan change requires a credit card.", {message: msg});
            return;
        }

        var requestData = { 
            planid: newPlan.data('planid'), 
            _csrf: $('meta[name="csrf-token"]').attr("content"), 
        };

        var title = "Are you sure you want to change plan?";
        if (newPlanType === "article") {
            title = "Are you sure you want to purchase this article pack?";
        }
        Acme.SigninView.render("userPlanChange", title, {message: msg})
            .done(function() {
                $('#dialog').parent().remove();
                
                $.ajax({
                    type: 'post',
                    url: _appJsConfig.baseHttpPath + '/user/change-paywall-plan',
                    dataType: 'json',
                    data: requestData,
                    success: function (data, textStatus, jqXHR) {
                        if (data.success == 1) {
                            window.location.reload();
                        } else {
                            $('#dialog').parent().remove();
                            Acme.SigninView.render("userPlan", data.error);
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        $('#createUserErrorMessage').text(textStatus);
                    },
                });
        }); 
    });

};




Acme.UserProfileController.prototype.listingEvents = function() {
    $('.j-deleteListing').unbind().on('click', function(e) {
        e.preventDefault();
        var listing = $(e.target).closest('li');
        var id      = listing.data("guid");
        Acme.SigninView.render("userDelete", "Are you sure you want to delete this listing?", {'role': 'okay'})
            .done(function() {
                Acme.server.create('/api/article/delete-user-article', {"articleguid": id}).done(function(r) {
                    listing.remove();
                }).fail(function(r) {
                    console.log(r);
                });
            });
    });  
};



(function ($) {

var StripeCard = function(){};
StripeCard.prototype.get = function(stripe) {


// Create an instance of Elements
    var elements = stripe.elements();

    // Custom styling can be passed to options when creating an Element.
    // (Note that this demo uses a wider set of styles than the guide below.)
    var style = {
        base: {
            color: '#32325d',
            lineHeight: '24px',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    };

    // Create an instance of the card Element
    var Card = elements.create('card', {style: style});

    // Add an instance of the card Element into the `card-element` <div>
    var cardElement = document.getElementById('card-element');
    if (cardElement != null) {
        Card.mount('#card-element');
    }

    // Handle real-time validation errors from the card Element.
    Card.addEventListener('change', function(event) {
        var displayError = document.getElementById('card-errors');
        displayError.textContent = '';
        if (event.error) {
            displayError.textContent = event.error.message;
        } 
    });

    return Card;
}













var PurchaseForm = function(id) {
    this.id = id || null;
    // this.parent = Form.prototype;

    this.data = {
        "plan_id": null,
        "terms": false,
    };


    this.errorFields = [];

    this.validateRules = {
        "plan_id" : ["notEmpty"],
        "terms" : ["isTrue"],
    };

    this.validateFields = Object.keys(this.validateRules);

    this.spinner = new Acme.modal('modal', 'spinner-modal', {"spinner": 'spinnerTmpl'});
    this.stripeSetup();
    this.loadData();
    this.events();
    this.localEvents();

};


PurchaseForm.prototype = new Acme.Form(Acme.Validators);
// PurchaseForm.prototype = new Form(Validators);
PurchaseForm.constructor = PurchaseForm;

PurchaseForm.prototype.stripeSetup = function () {
    var self = this;
    var stripekey = $('#stripekey').html();
    this.stripe = Stripe(stripekey);
    var stripeCard = new StripeCard();
    this.card = stripeCard.get(this.stripe);
}
PurchaseForm.prototype.localEvents = function(event) {
    var self = this;
    $('.j-purchaseplan_select').on('click', function(e) {
        var plans = $('#purchase-plans');
        plans.children().each(function(p) {
            $(this).addClass('paywall-plan-card--unselected');
        });
        var newPlan = $(e.target);
        if (!newPlan.hasClass('j-purchaseplan_selected')) {
            newPlan = $(e.target.parentNode);
        }
        self.data.plan_id = newPlan.data('planid');
        newPlan.removeClass('paywall-plan-card--unselected');
    });
};
PurchaseForm.prototype.submit = function(event) 
{
    var self = this;
    event.preventDefault();
    console.log(self.data.plan_id);
    console.log('submitting!!!');


    var validated = self.validate();
    if (!validated) {
        if (!this.data.terms) {
            // new Acme.modal();
            // this.confirmView = new Modal('modal', 'signin-modal', {'terms': 'subscribeTerms'});
            this.confirmView = new Acme.modal('modal', 'signin-modal', {'terms': 'subscribeTerms'});
            this.confirmView.render("terms", "Almost there");
            return;
        }
        if (!this.data.plan_id) {
            this.confirmView = new Acme.modal('modal', 'signin-modal', {'terms': 'purchasePlan'});
            this.confirmView.render("terms", "Almost there");
            return;
        }
        console.log(self.errorFields);
    }



    self.spinner.render("spinner", "Your request is being processed.");

    var errorElement = document.getElementById('card-errors');

    errorElement.textContent = '';
    // const stripe = Stripe(self.stripekey);
    self.stripe.createToken(self.card).then(function(result) {
        // console.log(result);
        if (result.error) {
            self.spinner.closeWindow();

            // Inform the user if there was an error
            var errorElement = document.getElementById('card-errors');
            errorElement.textContent = result.error.message;
        } else {
            // Send the token to your server

            var formdata = {
                "stripetoken":result.token.id,
                "planid": self.data.plan_id,
                "redirect" : false
            }

            Acme.server.create(_appJsConfig.baseHttpPath + '/auth/paywall-purchase', formdata).done(function(r) {
                if (r.success === 1) {
                    location.reload();
                    return;
                }
                self.spinner.closeWindow();
            });

        }
    });
            
};

if ($('#stripekey').length > 0 && $('#purchase-plan-form').length > 0 ) {
    console.log('creating a purchase form');
    Acme.subscribe = new PurchaseForm('purchase-plan-form');
}
}(jQuery)); 