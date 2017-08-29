var menudata = {
      'menu':{},
      'tablenumber': [],
      'remarks': []
    }, 
    order = {
      'tablenumber': '',
      'totalprice': 0,
      'items': [],
    },
    resetorder = JSON.parse(JSON.stringify(order));//make a clone for reset after order

$.getJSON('init', function(data) {
  //data is the JSON string
  menudata = data;
  init();
});

function init(){
  //reform the json data so it will be include some extra data
  menudata.menu.forEach(function(category){
    category.items.forEach(function(item){
      item.count = 0;
    });
  });

  //reset order
  order = JSON.parse(JSON.stringify(resetorder));

  //init every vue objects' data variable
  cat.menudatalink = menudata;
  extraorder.menudatalink = menudata;
  tablenum.tablenumber = menudata.tablenumber;
  checkorder.order_list = order;

  //init layout view
  $('.layout').hide();
  toggleto('#tablenum','#tablenum');

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
  });
}

function sendorder(){
  
  order.items.forEach(function(item){
    //reset counting of item
    item.itemlink.count=0;
    //delete **itemlink which is useless for serverside before sending data
    delete item.itemlink;
  });
  //send order
  $.ajax({
      url: 'order',
      type: 'POST',
      data: JSON.stringify(order),
      dataType: 'html',
      async: false,
      success: function(data) {
        toggleto('#checkorder','#tablenum');
      },
      error: function (data) {
        alert(data.responseText);
    }
  });
}

//toggle between layout
var previousid;
function toggleto(currentid, targetid){
  previousid = currentid;
  $(currentid).hide();
  $(targetid).show();
}
function back(){
  //if menu is visible, of coz previousid is #tablenum
  var menushown = $('#menu').is(':visible');
  previousid = (menushown ? '#tablenum' : previousid);

  $('.layout').hide();
  $(previousid).show();
}

//vue objects
var tablenum = new Vue({
  el: '#tablenum',
  data: {
    tablenumber: [],  //given value in init()
    orderlink: {},
  },
  methods: {
    selectnumber: function(tablenumber){
      init();
      order.tablenumber=tablenumber;
      toggleto('#tablenum','#menu');
    }
  }
});

var extraorder = new Vue({
  el: '#extraorder',
  data: {
    menudatalink: {}, //given value in init()
    itemlink: {}, //given value in cat.extra() method
    remarks: [],
    extraindex: [],
    extra: [],
    addprice: 0,
    remarktext: '',
  },
  watch: {
    'extraindex': function(){
      var extra=[], menudatalink=this.menudatalink;
      var addprice=0;
      this.extraindex.forEach(function(index){
        //the index which recorded in extraindex are related in menudatalink.extra
        extra.push(menudatalink.extra[index]);
        addprice +=menudatalink.extra[index].price;
      });
      this.addprice = addprice;
      this.extra = extra;
    }
  },
  methods: {
    'addremark': function(remark){
      this.menudatalink.remarks.push({"text":remark});
      this.remarks.push(remark);
    },
    'order': function(){
      order.items.push({
        'itemlink': this.itemlink,
        'id': this.itemlink.id,
        'name': this.itemlink.name,
        'remarks': this.remarks,
        'extra': this.extra,
        'price': this.itemlink.price + this.addprice
      });
      order.totalprice += this.itemlink.price + this.addprice;
      this.itemlink.count +=1;
      //reset
      this.remarks=[];
      this.extraindex=[];
      toggleto('#extraorder','#menu');
    }
  }
});

var checkorder = new Vue({
  el: '#checkorder',
  data: {
    order_list: order,
  },
  methods: {
    'extratext': function(item){
      var text = "";
      this.item.remarks.forEach(function(remark){
        text += remark + " ; ";
      });
      this.item.extra.forEach(function(extra){
        text += extra + " ; ";
      });
      return text;
    },
    'cancel': function(orderitem){
      orderitem.itemlink.count -=1;
      this.order_list.totalprice -=orderitem.price;
      var index= this.order_list.items.indexOf(orderitem);
      this.order_list.items.splice(index,1);
    }
  }
});

var cat = new Vue({
  el: '#menu',
  data: {
    menudatalink: {}, //given value in init()
  },
  methods: {
    'order': function(item){
      order.items.push({
        itemlink: item,
        'id': item.id,
        'name': item.name,
        'remarks': [],
        'extra': [],
        'price': item.price
      });
      order.totalprice += item.price;
      item.count +=1;
    },
    'extra': function(item){
      extraorder.itemlink = item;
      extraorder.remarks = [];
      extraorder.extra = [];
      toggleto('#menu','#extraorder');
    }
  }
});

