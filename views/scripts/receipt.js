class Receipt{
  constructor(canvas, config){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.config = config || {
      font: 'Arial',
      fontsize: {
        h1: { size: 60, lh: 45 }, //lh is shor form of lineheight
        h2: { size: 60, lh: 45 },
        h3: { size: 32, lh: 30 }, //h3 is default fontsize
        h4: { size: 26, lh: 24 } //h3 is default fontsize
      },
      width: 575 
    } 
    this.fontsize = this.config.fontsize;
    this.fonttype = this.config.font;

    this.width = this.config.width;
    this.canvas.width = this.config.width;

    this.x = 0; //x-position of text
    this.y = 0; //height set for new line, y-position of text
    this.canvas.height = 0; //the length of receipt
    this.lineheight = this.fontsize.h3.lh;

    this.texts = [
      //{text:"Text", font: this.fontsize.h3, x:0}
    ]
  }

  //methods

  getTextwidth(text, font){
    var fontbackup = this.ctx.font;
    this.ctx.font = font
    var width = this.ctx.measureText(text).width;
    //restore ctx font
    this.ctx.font = fontbackup;
    return width;
  }
  getFont(isbold, fontsize, fonttype){
    return (isbold?'bold ':'') + fontsize.size+'px ' + fonttype;
  }

  //addText('Text',{
  //  fontsize:this.fontsize.h1,
  //  isbold: true||false,
  //  fonttype:'Arial',
  //  align:'left'||'center'||'right',
  //  x:{},
  //});
  addText(text, options){
    var fontsize = this.fontsize.h3,
        isbold = false,
        fonttype = this.fonttype,
        align = 'left',
        x = this.x;
    options = options || {}; //set a value to prevent typeof(options.blah) return error
      if(typeof(options.isbold)!='undefined'){ isbold = options.isbold; }
      if(typeof(options.fontsize)!='undefined'){ fontsize = options.fontsize; }
      if(typeof(options.fonttype)!='undefined'){ fonttype = options.fonttype; }
      if(typeof(options.x)!='undefined'){ x = options.x; }
      if(typeof(options.align)!='undefined'){ align = options.align; }

    //console.log("hahah:"+JSON.stringify(options));
    var font = this.getFont(isbold, fontsize, fonttype);
    //console.log(font);
    //console.log(options);
    switch(options.align){
      case 'left':
        break;
      case 'center':
        x = this.width/2 - this.getTextwidth(text, font)/2;
        break
      case 'right':
        x = this.width - this.getTextwidth(text, font);
        break;
    }
    this.x = x + this.getTextwidth(text, font);


    this.lineheight = Math.max(this.lineheight, fontsize.lh);
    this.texts.push({
      'text': text,
      'font': font,
      'x': x
    });
    //this.ctx.font = this.getfont();
  }

  println(){
    this.y+=this.lineheight;

    var imageData = this.ctx.getImageData(0, 0, canvas.width-1, canvas.height-1);
    this.canvas.height = this.y + 5;
    this.ctx.putImageData(imageData, 0, 0);
    //canvas.width = this.config.width;

    var texts = this.texts;
    //console.log(texts);
    for(var c=0; c<texts.length; c++){
      this.ctx.font = texts[c].font;
      this.ctx.fillText(texts[c].text, texts[c].x, this.y);
    }
    
    //reset
    this.x=0;
    this.lineheight = 0;
    this.texts = []; //reset
  }
    //if(this.width - width - this.getTextwidth(text) >=0){
      //this.ctx.fillText(text, width, this.height);
    //}
  
  //addTextRight(text){
    //this.print(text, null, this.width-this.getTextwidth(text));
  //}
  newline(){
    this.addText('');
    this.println();
  }
  splitline(){
    this.newline();
    this.ctx.moveTo(0, this.y);
    this.ctx.lineTo(this.width, this.y);
    this.ctx.stroke();
    this.newline();
  }
  clear(){
    //this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.y = 0; //height set for new line, y-position of text
    this.canvas.height = 0;
    //canvas.width = this.config.width;
  }
}

