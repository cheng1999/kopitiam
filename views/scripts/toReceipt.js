function ToReceipt(receipt){
  this.receipt = receipt;
}

ToReceipt.prototype.getImages = function(data, code){
  var receipt = this.receipt;

  var images = [];
  var printers = []; //printers queue list

  for(var c=0; c<data.items.length; c++){
    //var printer_data = dbop.getPrinter(data.items[c].id);
    var printer_name = data.items[c].printer;
    //data.items[c].printername = printer_data.name;
    if(!printers.includes(printer_name))  printers.push(printer_name);
  }
  //console.log(printers);

  //pnow stand for 'printer now', or printer current
  for(var pnow=0; pnow<printers.length; pnow++){
    receipt.addText("Table: ", { fontsize: receipt.fontsize.h4 });//+ data.tablenumber);
    receipt.addText(data.tablenumber, { fontsize: receipt.fontsize.h2 });
    
    var date = new Date();
    receipt.addText(
      (date.getMonth()+1) + '/'+date.getDate() + '|' + date.getHours() + ':' + date.getMinutes() + ' | ' + code,
      { fontsize: receipt.fontsize.h4, align:'right' }
    );

    receipt.println();
    receipt.newline();

    //print items
    var totalprice = 0;
    for(var c=0; c<data.items.length; c++){
      var item = data.items[c];
      if(item.printer != printers[pnow])continue;

      //console.log(item);
      totalprice += item.price*item.count;
      
      receipt.addText( item.count + ' x ' + item.name );
      receipt.addText( (item.price*item.count).toFixed(2), { align:'right' });
      receipt.println();

      //extra text
      var extra_text = [];
      for(var d=0; d<item.extra.length; d++){
        extra_text.push(item.extra[d].text);
      }
      extra_text = extra_text.length>0 ? extra_text.join()+' / ' : '';
      var remarks_text = item.remarks.length>0 ? item.remarks.join() : '';
      var extratext = (extra_text||remarks_text) ?  '*( ' + extra_text + item.remarks.join() + ' )' : '';
      if(extratext){
        receipt.addText(extratext, {x: 20});
        receipt.println();
      }
    }

    //end, footer
    receipt.newline();
    receipt.addText("Total: RM"+totalprice.toFixed(2), { align:'right' });
    receipt.println();

    images.push({
      'printer': printers[pnow],
      'image': canvas.toDataURL().substr('data:image/png;base64,'.length)
    });
    receipt.clear();

  }

  //return images.replace('data:image/png;base64,','');
  return images
}
 


