window.data={};

//initial
refresh_data(init);


function refresh_data(callback){
  $.getJSON('/init', function(thisdata) {
    //data is the JSON string
    window.data = thisdata;

    vueForm.datalink = window.data;
    vueItemMenu.datalink = window.data;
    vueItems.datalink = window.data;
    vuePrinters.datalink = window.data;
    vueTablenum.datalink = window.data;
    vueExtra.datalink = window.data;

    //reset elements' position, because the data is updated
    $('.sortable').sortable('cancel');

    callback();
  });
}

function init(){
    //take reference to https://vuejs.org/v2/api/#Vue-nextTick
  Vue.nextTick(function(){
    //semantic's function: combine menu and tab together,
    //when menu item was clicked, tab will show as item clicked
    $('#menu .item').tab(); 
    //makesure there's no actived tab, then active first tab
    $('#menu .item').removeClass('active');
    $('#menu .tab').removeClass('active');
    //active first tab
    $('#menu .item')[0].className+=' active';
    $('#menu .tab')[0].className+=' active';
    //$('.ui.modal.tablenum').modal('show');
    $('.ui.dropdown.category').dropdown({allowAdditions: true});
    $('.ui.dropdown.printer').dropdown({allowAdditions: false});

    //ui modal init
    $('.ui.modal').modal();

    //sort table
    $('table').tablesort();
    
    //drag to sort item
    //https://stackoverflow.com/a/12962399/5617437
    $("#draggable_categories, #draggable_table, #draggable_items, #draggable_remarks, #draggable_extra").addClass("sortable");
    $(".sortable").sortable({
      start: function(event, ui) {
        ui.item.position_bfr = ui.item.index();
      },
      stop: function(event, ui) {
        var sortable_id = ui.item.parent().get(0).id;
        var target;

        switch(sortable_id){
          case 'draggable_categories':
            target = 'category_position';
            break;
          case 'draggable_table':
            target = 'tablenumber_position';
            break;
          case 'draggable_items':
            target = 'item_position';
            break;
          case 'draggable_remarks':
            target = 'remark_position';
            break;
          case 'draggable_extra':
            target = 'extra_position';
            break;
          default:
            break;
        };

        sendAjax({
          data:{
            'update':{
              'target': target,
              'id': window.mousedown_itemid, 
              'position_bfr': ui.item.position_bfr, //position before
              'position': ui.item.index(), //position after
            }
          },
          success: function(data){
            refresh_data(function(){vueItemMenu.showcat(window.clicked_category)});
          },
          error: function(data){
            alert(JSON.stringify(data));
            alert('error occur, please reload and try again');
          }
        });
      }
    });
    sortitem_switcher(false);
    vueItemMenu.showcat(window.data.categories[0].name);
  });
}

var sortitem_checked = false;
function sortitem_switcher(checked){
  if(!checked){
    sortitem_checked = false;
    $('.sortable').sortable('disable');
  }
  else{
    sortitem_checked = true;
    $('.sortable').sortable('enable');
  }
  vueItemMenu.$forceUpdate();
  vueTablenum.$forceUpdate();
}

function sendAjax(config){
  $.ajax({
      url: '/config',
      type: 'POST',
      data: JSON.stringify(config.data),
      dataType: 'html',
      async: false,
      success: function(data) {
        config.success(data);
      },
      error: function (data) {
        if(config.error){
          config.error(data);
          return;
        }
        alert(JSON.stringify(data));
    }
  });
}

var vueForm = new Vue({
  el: '#item_form',
  data: {
    'datalink': {}, //given value in init()
    'type':'modify',
    'item': {
      'name':'',
      'category':'',
      'printer':'',
      'price': 0,
      'background':'#ffffff',
      'font':'#555555',
    },
  },
  methods: {

    'add': function(){
      var datalink = this.datalink;
      var item = this.item;
      //price is in float format
      item.price = parseFloat(item.price);
      sendAjax({
        data:{
          'add':{
            'target':'items',
            'item':item,
          }
        },
        success: function(data){
          refresh_data(function(){vueItemMenu.showcat(window.clicked_category)});
          
          $('#item_form.ui.modal').modal('hide');
        },
      });
    },
    'modify': function(){
      var item = this.item;
      item.price = parseFloat(item.price);
      sendAjax({
        data:{
          'update':{
            'target':'items',
            'item':item,
          }
        },
        success: function(data){
          refresh_data(function(){});
          $('#item_form.ui.modal').modal('hide');
        },
      });
    },
    'remove': function(itemid){
      if(!confirm("Are you sure ?")){return ;}
      var datalink = this.datalink;
      sendAjax({
        data:{
          'remove':{
            'target':'items',
            'id':itemid
          }
        },
        success: function(data){
          refresh_data(function(){vueItemMenu.showcat(window.clicked_category)});
        },
      });
    },
   'modify_modal': function(item){
      this.type = 'modify'; 
      this.item = item; 
      //semantic ui dropdown doesn't show default value so use following codes
      $('#item_form .category').dropdown('set selected', item.category);
      $('#item_form .printer').dropdown('set selected', item.printer);
      $('.ui.modal').modal('show');
    },
    'add_modal': function(){
      this.type = 'add';
      $('.ui.modal').modal('show');
    }

  }
});

var vueItems = new Vue({
  el: '#items',
  data: {
    'datalink': {}, //given value in init()
    'item': {},
    'form': {
      'type':'add',
      'class': '',
      'item': {
        'name':'',
        'category':'',
        'printer':'',
        'price': 0,
        'background':'#ffffff',
        'font':'#555555',
        }
    },
  },
  methods: {

    'add': function(){
      var datalink = this.datalink;
      var form = this.form;
      //price is in float format
      form.item.price = parseFloat(form.item.price);
      sendAjax({
        data:{
          'add':{
            'target':'items',
            'item':form.item,
          }
        },
        success: function(data){
          refresh_data(function(){vueItemMenu.showcat(window.clicked_category)});
        },
      });
    },
    'modify': function(){
      var form = this.form;
      form.price = parseFloat(form.item.price);
      sendAjax({
        data:{
          'update':{
            'target':'items',
            'item':form.item,
          }
        },
        success: function(data){
          refresh_data(function(){});
          $('#item_form.ui.modal').modal('hide');
        },
      });
    },
    'remove': function(item){
      var datalink = this.datalink;
      sendAjax({
        data:{
          'remove':{
            'target':'items',
            'id':item.id
          }
        },
        success: function(data){
          refresh_data(function(){vueItemMenu.showcat(window.clicked_category)});
        },
      });
    },
   'modify_modal': function(item){
      //this.formtypes[1].bakcupitem = json.parse(json.stringify(item));
      form.type = 'modify'; 
      this.item = item; 
      //semantic ui dropdown doesn't show default value so use following codes
      $('#item_form.ui.modal .category').dropdown('set selected', item.category);
      $('#item_form.ui.modal .printer').dropdown('set selected', item.printer);
      $('.ui.modal').modal('show');
    },

  }
});

var vueItemMenu = new Vue({
  el: '#itemmenu',
  data: {
    'datalink': {}, //given value in init();
    'items': [], //value given in methods showcat()
  },
  methods: {
    'showcat': function(category_name){
      window.clicked_category = category_name;
      var cat_items = [];
      window.data.items.forEach(function (item){
        if(item.category === category_name){
          cat_items.push(item);
        }
      });
      this.items = cat_items;
    }
  }
});

var vuePrinters = new Vue({
  el: '#printers',
  data: {
    'datalink': {}, //given value in init()
    'form':{
      'name':'',
      'ip':'192.168.192.168',
      'port': 9100,
    }
  },
  methods: {
    'add': function(){
      var datalink = this.datalink;
      this.form.port = parseInt(this.form.port);
      sendAjax({
        data:{
          'add':{
            'target':'printers',
            'data':this.form
          }
        },
        success: function(data){
          refresh_data(function(){});
        },
      });
    },
    'remove': function(printer){
      var datalink = this.datalink;
      sendAjax({
        data:{
          'remove':{
            'target':'printers',
            'id':printer.id
          }
        },
        success: function(data){
          refresh_data(function(){});
        },
      });
    }
  }
});

var vueTablenum = new Vue({
  el: '#tablenum',
  data: {
    'datalink': {}, //given value in init()
    'form':{
      'number':'',
    }
  },
  methods: {
    'add': function(){
      var datalink = this.datalink;
      sendAjax({
        data:{
          'add':{
            'target':'tablenumber',
            'data':this.form
          }
        },
        success: function(data){
          refresh_data(function(){
            vueTablenum.form.number='';
          });
        },
      });
    },
    'remove': function(table){
      var datalink = this.datalink;
      sendAjax({
        data:{
          'remove':{
            'target':'tablenumber',
            'id':table.id
          }
        },
        success: function(data){
          refresh_data(function(){});
        },
      });
    }
  }
});
var vueExtra = new Vue({
  el: '#extra',
  data: {
    'datalink': {}, //given value in init()
    'extraform':{
      'text':'',
      'price':0
    },
    'remarksform':{'text':''},
  },
  methods: {
    'add': function(target){
      this.extraform.price = parseFloat(this.extraform.price);
      var form = (target == 'extra' ? this.extraform : this.remarksform);
      var datalink = this.datalink;
      sendAjax({
        data:{
          'add':{
            'target': target,
            'data': form
          }
        },
        success: function(data){
          refresh_data(function(){});
        },
      });
    },
    'remove': function(target, id){
      if(!confirm("Are you sure ?")){return ;}
      var datalink = this.datalink;
      sendAjax({
        data:{
          'remove':{
            'target': target,
            'id': id
          }
        },
        success: function(data){
          refresh_data(function(){});
        },
      });
    },
  }
});
var vueGeneral = new Vue({
  el: '#general',
  data: {
    'passwordform':{
      'oldpass': '',
      'newpass': '',
      'comfirmpass': ''
    },
  },
  methods: {
    'changepassword': function(){
      var oldpass = this.passwordform.oldpass,
          newpass = this.passwordform.newpass,
          comfirmpass = this.passwordform.comfirmpass;

      if(this.passwordform.newpass !== this.passwordform.comfirmpass){
        alert('Password Don\'t Match');
        return;
      }
      sendAjax({
        data:{
          'update':{
            'target': 'password',
            'oldpass': $.MD5(oldpass),
            'newpass': $.MD5(newpass),
          }
        },
        success: function(data){
          //delete cookie, logout
          document.cookie = 'hash' + '=; Max-Age=0'
          location.reload();
        },
        error: function(data){
          alert(data.responseText);
          vueGeneral.passwordform.oldpass = '';
          vueGeneral.passwordform.newpass = '';
          vueGeneral.passwordform.comfirmpass = '';
        }
      });
    },
  }
});
