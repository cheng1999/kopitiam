window.data = {
      'items':{},
      'tablenumber': [],
      'remarks': []
    }; 
window.order = {
      'tablenumber': '',
      'totalprice': 0,
      'items': [],
      'images': [], //receipt image
    };
    var resetorder_sample = JSON.parse(JSON.stringify(order));//make a clone for reset after order

var sendOrderButton = $('#sendOrderButton');
var canvas=  document.getElementById('receipt');
var receipt = new Receipt(canvas);
var toReceipt = new ToReceipt(receipt);

$.getJSON('init', function(data) {
  //data is the JSON string
  window.data = data;
  init();
});

function init(){
  //reform the json data so it will be include some extra data
  window.data.items.forEach(function(item){
    item.count = 0;
  });


  //reset order
  order = JSON.parse(JSON.stringify(resetorder_sample));

  //init every vue objects' data variable
  extraorder.datalink = window.data;
  extraorder.orderlink = window.order;
  tablenum.tablenumber = window.data.tablenumber;
  tablenum.orderlink = window.order;
  checkorder.orderlink = window.order;
  cat.datalink = window.data;
  cat.showcat(window.data.categories[0]);
  

  sendOrderButton.prop('disabled', false);
  sendOrderButton.prop('value','Send');

  //init layout view
  //$('.layout').hide();
  toggleto('#tablenum');
  $('.dropdown').dropdown();
  $('.modal').modal();
}
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

function sendorder(){

  sendOrderButton.prop('disabled', true);
  sendOrderButton.prop('value','Sending...');
  
  //recover order if error
  var backuporder = JSON.parse(JSON.stringify(order));

  //sort order
  order.items.sort(GetSortOrder("category"));
  order.items.forEach(function(item){
    item.extra.sort(GetSortOrder("text"));
    item.remarks.sort();
  });

  //format the order
  order.items.forEach(function(item){
    delete item.itemlink;
  });

  function ajaxerror(data){
    order = backuporder;
    alert(data.responseText);

    sendOrderButton.prop('disabled', false);
    sendOrderButton.prop('value','Send');
  }

  var queuenumber;
  $.ajax({
    url: 'getnumber', 
    type: 'POST',
    async: false,
    success: function(data) {
      queuenumber = data;
    },
    error: function(data){
      ajaxerror(data);
    }
    //data is the JSON string
  });
  // don't continue if getnumber ajax returned error
  if (queuenumber === undefined) return;

  order.queuenumber = parseInt(queuenumber);
  order.images = toReceipt.getImages(order, '#'+queuenumber);

  var orderclone = JSON.parse(JSON.stringify(order));

  //send order
  $.ajax({
    url: 'order',
    type: 'POST',
    data: JSON.stringify(orderclone),
    //dataType: 'html',
    //async: false,
    success: function() {
      //toggleto('#home','#tablenum');
      init();
    },
    error: function(data){
      ajaxerror(data);
    }
  });
}

function amendorder(){
  var id = $('#amend_id').val(),
    hash = $.MD5($('#amend_password').val());

  $('#amend_password').val('');
  $.ajax({
    url: 'getorder', 
    type: 'POST',
    data: JSON.stringify({
      'id': id,
      'hash':hash 
    }),
    async: false,
    success: function(data) {
      window.order = data;
      window.order.amendid = id;
      window.order.amendhash = hash;
      window.order.totalprice = 0;
      data.items.forEach(function(item){
        window.order.totalprice += item.count*item.price;
      });


      extraorder.orderlink = window.order;
      tablenum.orderlink = window.order;
      checkorder.orderlink = window.order;
      toggleto('#home');
    },
    error: function(data){
      alert(data.responseText);
    }
    //data is the JSON string
  });
}

//to check if order is repeated, 
//then simply do count++ but not make a new list with same data
function checkrepeated(order_tocheck){
  //clone it, so it is not a link
  order_tocheck = JSON.parse(JSON.stringify(order_tocheck));

  for(c=0; c<order.items.length; c++){
    var item = order.items[c];
    if(order_tocheck.id !== order.items[c].id)continue;

    //if same item, then dig in to check are their remarks and extra same
    //check if they are totally same
    if(JSON.stringify(order_tocheck.remarks) === JSON.stringify(order.items[c].remarks) &&
      JSON.stringify(order_tocheck.extra) === JSON.stringify(order.items[c].extra)
    ){
      order.items[c].count++;
      return true;
    }
    return false;
  }
  //reset count
  return false;
}

//toggle between layout
var urlhash_times=0;
location.hash = 0;
function toggleto(targetid){
  location.hash = ++urlhash_times;
  $('.layout').hide();
  $(targetid).show();
}
function back(){
  urlhash_times--; //location.hash = urlhash_times;
  //if home is visible, of coz previousid is #tablenum
  function visible(elementid){
    return $(elementid).is(':visible');
  }
  var targetid = (function(){
    if(visible('#tablenum')){
      $('.ui.modal').modal('hide');
      return '#tablenum';
    }
    if(visible('#home')) return '#tablenum';
    if(visible('#extraorder')) return '#home';
  })(); 

  $('.layout').hide();
  $(targetid).show();
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
      toggleto('#home');
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
      this.extra.sort(GetSortOrder('text'));
      this.remarks.sort()

      var order_tocheck = { 
        'count': 1,
        'itemlink': this.itemlink,
        'id': this.itemlink.id,
        'name': this.itemlink.name,
        'remarks': this.remarks,
        'extra': this.extra,
        'price': this.itemlink.price + this.addprice,
        'printer': this.itemlink.printer
      };
      if(!checkrepeated(order_tocheck)){
        this.orderlink.items.push(order_tocheck);
      }

      this.orderlink.totalprice += this.itemlink.price + this.addprice;
      //this.itemlink.count +=1;
      //reset
      this.remarks=[];
      this.extraindex=[];
      toggleto('#home');
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
    items: [], //value given in methods showcat()
  },
  methods: {
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
        'price': item.price,
        'printer': item.printer
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
      toggleto('#extraorder');
    }
  }
});

// TODO add service worker code here
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/swmain.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
