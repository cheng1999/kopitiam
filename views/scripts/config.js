var data = {};

$.getJSON('init', function(thisdata) {
  //data is the JSON string
  data = thisdata;
  init();
});

function init(){

  vueItems.datalink = data;
  vuePrinters.datalink = data;
  vueTablenum.datalink = data;
  vueExtra.datalink = data;

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
    //sort table
    $('table').tablesort();
  });
}

function sendAjax(config){
  $.ajax({
      url: 'config',
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

var vueItems = new Vue({
  el: '#items',
  data: {
    'datalink': {}, //given value in init()
    'form':{
      'name':'',
      'category':'',
      'printer':'',
      'price':0
    }
  },
  methods: {
    'add': function(){
      var datalink = this.datalink;
      this.form.price = parseFloat(this.form.price);
      sendAjax({
        data:{
          'add':{
            'target':'items',
            'data':this.form
          }
        },
        success: function(data){
          datalink.items.push(JSON.parse(data));
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
          for(var c=0; c<datalink.items.length; c++){
            if(datalink.items[c].id === item.id){
              datalink.items.splice(c,1);
              //console.log(datalink.items.splice(c));
              break;
              //c--;
            }
          }
        },
      });
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
          datalink.printers.push(JSON.parse(data));
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
          for(var c=0; c<datalink.printers.length; c++){
            if(datalink.printers[c].id === printer.id){
              datalink.printers.splice(c,1);
              //console.log(datalink.items.splice(c));
              break;
              //c--;
            }
          }
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
          datalink.tablenumber.push(JSON.parse(data));
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
          for(var c=0; c<datalink.tablenumber.length; c++){
            if(datalink.tablenumber[c].id === table.id){
              console.log(table.id);
              datalink.tablenumber.splice(c,1);
              break;
            }
          }
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
    'remarksform':{'text':''}
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
          var targetlink;
          switch(target){
            case 'extra':
              targetlink = datalink.extra;
              break;
            case 'remarks':
              targetlink = datalink.remarks;
              break;
          }
          targetlink.push(JSON.parse(data));
        },
      });
    },
    'remove': function(target, id){
      console.log(target+"-"+id);
      var datalink = this.datalink;
      sendAjax({
        data:{
          'remove':{
            'target': target,
            'id': id
          }
        },
        success: function(data){
          var targetlink;
          switch(target){
            case 'extra':
              targetlink = datalink.extra;
              break;
            case 'remarks':
              targetlink = datalink.remarks;
              break;
          }
          for(var c=0; c<targetlink.length; c++){
            if(targetlink[c].id === id){
              targetlink.splice(c,1);
              break;
            }
          }
        },
      });
    }
  }
});
