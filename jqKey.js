//=============================================================================
// jqKey
// Ver 0.2  ↑↓移動対応     2013.07.26
// Ver 0.3  OnOff対応     2013.11.29
// Ver 0.4  forms[0]依存解消・IE8以下サポート外  2014.11.09
//  MIT Licence  (自由に使ってください)
//  programed by Hidepyon
//  URL          http://hidepyon.hateblo.jp/entry/2014/11/09/232716
//=============================================================================
(function($){
 var setting = [];
 var d = document;
 var RangeId;
 var $df;
 //==============================
 // window help
 //==============================
 window.onhelp = function(){
  if(window.event) window.event.returnValue = false;
  return false;
 };
 
 $.fn.jqKey = function(options){
  var method = function(e){
   if(!setting.Active) return true;

   this.getCursorPosition = function(srcObj){
    var type = srcObj.type;
    var ln=0;//カーソル位置
    var w;//ワード
    var wln=0;//ワード長
    w = srcObj.value;
    wln = w.length;
    var s;
    switch(type){
     case "text":
     if(srcObj.selectionStart!=undefined){
      //IE 9 upper
      ln = srcObj.selectionStart;
     }
     break;
     case "textarea":
     if(srcObj.selectionStart!=undefined){
      //IE 9 upper
      ln = srcObj.selectionStart;
     }
     break;
     default:// "checkbox","button","radio","select-one","select-multiple"
     ln=0;wln=0;
     break;
    }

    return {First:(ln==0),Last:(ln==wln)};

   }

   var Focus_Move = function($frmObjs,shift){
    var Focus_Check = function(o){
     try{
      o.focus();
      if(o.select&&o.type!="button") o.select();
      return true;
     }catch(e){return false;}
    };
    var isVisible = function(o,n){
     if(n==undefined)n=10;
     while(--n>0){
      if(o.tagName=="BODY") return true;
      var os = o.style;
      if(os.display=="none"||os.visibility=="hidden") return false;
      o=o.parentElement;
     }
     return true;
    };

    //フォームオブジェクトが何番目か探す
    var ln = $frmObjs.length;
    if(ln<=0) return true;
    var i;
    for (i=0;i<ln;i++){
     if ($frmObjs[i]==obj) break;
    }
    //フォーカスを取得できないものは飛ばします
    var mv = (shift?-1:1);
    var j = (ln+i+mv) % ln;
    var Fo,Fs;
    var num = 0;
    while(true){

     Fo = $frmObjs[j];
     Fs = Fo.style;
     if (Fo.type!="hidden" &&
      !Fo.disabled &&
      Fo.tabIndex!=-1 &&
      isVisible(Fo)){

      //対象のオブジェクトを戻す
      if(Focus_Check(Fo)){
       break;//Focus成功
      }else{
       //Hitしない場合
       if(++num>50)break;
      }
     }
     j=(j+mv+ln) % ln;
    }
    return false;
   };

   var k = e.keyCode;
   var s = e.shiftKey;
   var c = e.ctrlKey;
   var a = e.altKey;
   var obj = e.target;
   
   var blKey = true;
   if (!setting.Enter&&k==13) return true;
   if (!setting.Tab&&k==9) return true;
   switch(k){
    case 32: //Space
     switch(obj.type){
     case"radio":case"checkbox": //Spaceで選択
      setTimeout(function(){$(obj).trigger("click");},0);
      blKey = false; //移動しない
      break;
                        default:
     }
    case 13: //Enter
     switch(obj.type){
     case"button":
     case"file":
      blKey = true;
      break;
     case"text":case"select-one":case"select-multiple":case"textarea":
      var CEln = setting.CtrlEnter.Names.length;
      if(c && CEln>0){
       var dfln = $df.length;
       while(dfln-->0){
        blKey = Focus_Move($df,false);
        obj = d.activeElement;
        for(var i=0;i<CEln;i++){
         if(obj.name==setting.CtrlEnter.Names[i]){
          return false;
         }
        }
       }
       blKey = true;
      }else{
       if (obj.type!="text-area"){
        blKey = false;
       }else{
        blKey = true;
       }
      }
      break;
     default:
      blKey = false;
      break;
     }
     //keyイベントを処理するもののみ抽出
     if (!blKey){
      //次のフォームオブジェクト探す
      blKey = Focus_Move($df,s);
     }
    break;
    case 9:  //tab
     switch(obj.type){
     case"file":
      blKey = true;
      break;
     default:
      //次のフォームオブジェクト探す
      blKey = Focus_Move($df,s);
      break;
     }

    break;
    case 8:  //backspace
     switch(obj.type){
     case"text":case"textarea":
      blKey = true;
      break;
     default:
      blKey = confirm("backspaceが押されました。\n前ページへ移動しますか？");
      break;
     }

    break;
    case 27://ESC
     if(setting.ESC){
      setting.ESC();
      blKey = false;
     }
    break;
    case 38://Up
     if(setting.UpDown && obj.name!=""){
      blKey = Focus_Move(d.getElementsByName(obj.name),true);
     }
     break;
    case 40://Down
     if(setting.UpDown && obj.name!=""){
      blKey = Focus_Move(d.getElementsByName(obj.name),false);
     }
     break;
    case 37://Left
     if(setting.LeftRight){
      if(getCursorPosition(obj).First){
       blKey = Focus_Move($df,true);
      }
     }
     break;
    case 39://Right
     if(setting.LeftRight){
      if(getCursorPosition(obj).Last){
       blKey = Focus_Move($df,false);
      }
     }
     break;
    default:
     if(k>=112&&k<=123){
      var fKeyNm = "F"+(k-111);
      var F = setting["F"+(k-111)];
      if(F){
       if(window.event)window.event.keyCode = 0;
       e.keyCode = 0;
       blKey = false;
       F(obj,{shift:s,ctrl:c,alt:a,fKey:fKeyNm});
      }
     }
    break;
   }
   return blKey;
  };
  var bind = function(){
   var $o = $(":input[type!=hidden]",RangeId);
   $df = $o.keydown(function(e){
    return method(e);
   });
  };
  var unbind = function(){
   $df.unbind("keydown");
  };

  var DOM_init = function(id){
   if(RangeId==undefined){
    if(setting.CtrlEnter.Names.length>0){
     //CtrlEnterオプションあれば、背景色設定
     $("<style type='text/css'>.jqKeyCtrlEnter{background-color:"+setting.CtrlEnter.bgColor+"}</style>").appendTo("head");
     $.each(setting.CtrlEnter.Names,function(idx,vl){
      $("[name='"+vl+"']").addClass("jqKeyCtrlEnter");
     });
    }
   }else{
    unbind();
   }
   RangeId =id;
   bind();
  };
  var defaults = {
   "Enter":false,
   "Tab":false,
   "F1":null,"F2":null,"F3":null,"F4":null,"F5":null,"F6":null,
   "F7":null,"F8":null,"F9":null,"F10":null,"F11":null,"F12":null,
   "ESC":null,
   "UpDown":false,
   "LeftRight":false,
   "CtrlEnter":{Names:[],bgColor:"lightblue"},
   "Active":true
  };
  if(typeof(options)=="string"){
   if(setting.length!=0){
    if(options=="disable"){
     setting.Active = false;
    }else if(options=="enable"){
     setting.Active = true;
    }else if(options=="dom"){
     DOM_init(this);
    }else if(options=="dispose"){
     setting = new Array();
     unbind();
    }

   }
   return;
  }else{
   setting = $.extend(true,{},(setting.length!=0)?setting:defaults,options);
  }

  DOM_init(this);
  return (this);//メソッドチェーン
 };
})(jQuery);
