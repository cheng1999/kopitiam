var data = {
      'items':{},
      'tablenumber': [],
      'remarks': []
    }, 
    order = {
      'tablenumber': '',
      'totalprice': 0,
      'items': [],
    },
    resetorder = JSON.parse(JSON.stringify(order));//make a clone for reset after order

  

$.getJSON('init', function(thisdata) {
  //data is the JSON string
  data = thisdata;
  init();
});

function init(){
  //reform the json data so it will be include some extra data
  data.items.forEach(function(item){
    item.count = 0;
  });


  //reset order
  order = JSON.parse(JSON.stringify(resetorder));

  //init every vue objects' data variable
  extraorder.datalink = data;
  extraorder.orderlink = order;
  tablenum.tablenumber = data.tablenumber;
  tablenum.orderlink = order;
  checkorder.orderlink = order;
  cat.datalink = data;
  cat.showcat(data.categories[0]);
  

  //init layout view
  $('.layout').hide();
  toggleto('#tablenum','#tablenum');

  //take reference to https://vuejs.org/v2/api/#Vue-nextTick
  //Vue.nextTick(function(){
    //semantic's function: combine menu and tab together,
    //when menu item was clicked, tab will show as item clicked
    //$('#menu .item').tab(); 
    //makesure there's no actived tab, then active first tab
    //$('#menu .item').removeClass('active');
    //$('#items').removeClass('active');
    //active first tab
    //$('#menu .item')[0].className+=' active';
    //$('#menu .tab')[0].className+=' active';
    //$('.ui.modal.tablenum').modal('show');
  //});
}

function sendorder(){
  
  var backuporder = JSON.parse(JSON.stringify(order));
  order.items.forEach(function(item){
    //reset counting of item
    //item.itemlink.count=0;
    //delete **itemlink which is useless for serverside before sending data
    delete item.itemlink;
    
  });

  //sort the items
  //referrence: http://www.c-sharpcorner.com/UploadFile/fc34aa/sort-json-object-array-based-on-a-key-attribute-in-javascrip/
  //Comparer Function  
  function GetSortOrder(prop) {  
    return function(a, b) {  
      if (a[prop] > b[prop]) {  
        return 1;  
      } else if (a[prop] < b[prop]) {  
        return -1;  
      }  
      return 0;  
    }; 
  }  
  order.items.sort(GetSortOrder("name"));
  order.items.forEach(function(item){
    item.extra.sort(GetSortOrder("text"));
    item.remarks.sort();
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
        order = backuporder;
        //temp=data;
        alert(data.responseText);
    }
  });
}
//var temp;

//to check if order is repeated, 
//then simply do count++ but not make a new order with same data
function checkrepeated(order_tocheck){
  //clone it, so it is not a link
  order_tocheck = JSON.parse(JSON.stringify(order_tocheck));

  for(c=0; c<order.items.length; c++){
    var item = order.items[c];
    if(order_tocheck.id !== order.items[c].id)continue;

    //count maynot same even order are same
    order_tocheck.count = order.items[c].count;
    // check if order is totally same
    if(JSON.stringify(order_tocheck) === JSON.stringify(order.items[c])){
      order.items[c].count++;
      return true;
    }
  }
  //reset count
  return false;
}

//toggle between layout
var urlhash_times=0;
var previousid;
function toggleto(currentid, targetid){
  urlhash_times++; location.hash = urlhash_times;
  previousid = currentid;
  $(currentid).hide();
  $(targetid).show();
}
function back(){
  urlhash_times++; location.hash = urlhash_times;
  //if home is visible, of coz previousid is #tablenum
  var homeshown = $('#home').is(':visible');
  previousid = (homeshown ? '#tablenum' : previousid);

  $('.layout').hide();
  $(previousid).show();
}
//listen back button of device
window.onhashchange = function(){     
  var thistimes = parseInt(location.hash.replace('#',''),10);     
  //if hash was minus 1, mean back button pressed
  if(thistimes == urlhash_times-1){
    back();
  }
};

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
      this.orderlink.tablenumber=tablenumber;
      toggleto('#tablenum','#home');
    }
  }
});

var extraorder = new Vue({
  el: '#extraorder',
  data: {
    temp:{},temp2:{},
    datalink: {}, //given value in init()
    orderlink: {},
    itemlink: {}, //given value in cat.extra() method
    remarks: [],
    extraindex: [],
    extra: [],
    addprice: 0,
    remarktext: '',
  },
  watch: {
    'extraindex': function(){
      var extra=[], datalink=this.datalink;
      var addprice=0;
      this.extraindex.forEach(function(index){
        //the index which recorded in extraindex are related in datalink.extra
        extra.push(datalink.extra[index]);
        addprice +=datalink.extra[index].price;
      });
      this.addprice = addprice;
      this.extra = extra;
    }
  },
  methods: {
    'addremark': function(remark){
      this.datalink.remarks.push({"text":remark});
      this.remarks.push(remark);
    },
    'order': function(){
      var order_tocheck = { 
        'count': 1,
        'itemlink': this.itemlink,
        'id': this.itemlink.id,
        'name': this.itemlink.name,
        'remarks': this.remarks,
        'extra': this.extra,
        'price': this.itemlink.price + this.addprice
      };
      if(!checkrepeated(order_tocheck)){
        this.orderlink.items.push(order_tocheck);
      }

      this.orderlink.totalprice += this.itemlink.price + this.addprice;
      //this.itemlink.count +=1;
      //reset
      this.remarks=[];
      this.extraindex=[];
      toggleto('#extraorder','#home');
    }
  }
});

var checkorder = new Vue({
  el: '#checkorder',
  data: {
    orderlink: order,
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
      orderitem.count --;
      this.orderlink.totalprice -= orderitem.price;
      if(orderitem.count !== 0)return;
      //remove order
      var index= this.orderlink.items.indexOf(orderitem);
      this.orderlink.items.splice(index,1);
    },
    'add': function(orderitem){
      orderitem.count ++;
      this.orderlink.totalprice += orderitem.price;
    }
  }
});

var cat = new Vue({
  el: '#menu',
  data: {
    datalink: {}, //value given in init()
    items: [],//value given in methods switch()
  },
  methods: {
    'test':function(a){},
    'showcat': function(category){
      var cat_items = [];
      this.datalink.items.forEach(function (item){
        if(item.category === category.name){
          cat_items.push(item);
        }
      });
      this.items = cat_items;
    },
    'order': function(item){
      var order_tocheck = {
        'count': 1,
        'itemlink': item,
        'id': item.id,
        'name': item.name,
        'remarks': [],
        'extra': [],
        'price': item.price
      };
      if(!checkrepeated(order_tocheck)){
        order.items.push(order_tocheck);
      }
      order.totalprice += item.price;
      //item.count +=1;
    },
    'extra': function(item){
      extraorder.itemlink = item;
      extraorder.remarks = [];
      extraorder.extra = [];
      toggleto('#home','#extraorder');
    }
  }
});

