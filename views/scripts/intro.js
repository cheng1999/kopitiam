//window.addEventListener("scroll", event => {
  //var elm = document.getElementsByClassName("toanim");
  //var elm = $(".toanim");
  //for(c=0; c<elm.length; c++){

    //the distace with bottom screen is negative value means the element is deeper
    //if(document.body.offsetHeight - elm[c].getBoundingClientRect.top < 0) continue;

    //$(".toanim").eq(c).addClass("animated bounceIn");

    //c--;

  //}
//})
var a;
var waypoints = $(".toanim").waypoint({
  handler: function() {
    $(this.element).addClass("animated bounceInRight");
  },
  offset: '65%'
});
