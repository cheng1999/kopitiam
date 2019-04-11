var admin_app = {
  pages:{
    'login':'#login_page',
    'menu':'#menu_page',
    'config':'#config_page',
    'statistics':'#statistics_page'
  },
}

admin_app.load = function(page){
  if(page === admin_app.pages.statistics){
    statistics_app.init();
  }
  console.log(page);
  if(page === admin_app.pages.statistics || page === admin_app.pages.config){
  console.log(page);
    location.hash =1;
  }

  $('.include_page').hide();
  $(page).show();
}
