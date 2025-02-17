// ==UserScript==
// @name          Download FB Album mod
// @author        indream
// @version       0.14.7.2
// @description   Download Facebook & Instagram Album by One Click.
// @namespace     DownAlbum
// @updateURL     https://raw.githubusercontent.com/inDream/DownAlbum/master/DownAlbum.meta.js
// @downloadURL   https://raw.githubusercontent.com/inDream/DownAlbum/master/DownAlbum.user.js
// @include       htt*://*.facebook.com/*
// @match         http://*.facebook.com/*
// @match         https://*.facebook.com/*
// @include       htt*://instagram.com/*
// @match         http://instagram.com/*
// @include       htt*://weibo.com/p/*/album*
// @match         http://weibo.com/p/*/album*
// @exclude       htt*://*static*.facebook.com*
// @exclude       htt*://*channel*.facebook.com*
// @exclude       htt*://developers.facebook.com/*
// @exclude       htt*://upload.facebook.com/*
// @exclude       htt*://*onnect.facebook.com/*
// @exclude       htt*://*acebook.com/connect*
// @exclude       htt*://*.facebook.com/plugins/*
// @exclude       htt*://*.facebook.com/l.php*
// @exclude       htt*://*.facebook.com/ai.php*
// @exclude       htt*://*.facebook.com/extern/*
// @exclude       htt*://*.facebook.com/pagelet/*
// @exclude       htt*://api.facebook.com/static/*
// @exclude       htt*://*.facebook.com/contact_importer/*
// @exclude       htt*://*.facebook.com/ajax/*
// @exclude       htt*://www.facebook.com/places/map*_iframe.php*
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// ==/UserScript==
function qS(s){return document.querySelector(s);}
function qSA(s){return document.querySelectorAll(s);}
var dFAinit = function(){
  if(document.querySelector('#dFA') || (location.href.indexOf('//www.facebook.com')<0 && location.href.indexOf('instagram.com')<0 && location.href.indexOf('weibo.com/p/')<0))return;
  var k = document.createElement('li');
  k.innerHTML = '<a id="dFA" class="navSubmenu" onClick="dFAcore();">DownFbAlbum</a>';
  var k2 = document.createElement('li');
  k2.innerHTML = '<a class="navSubmenu" onClick="dFAcore(true);">DownFbAlbum(Setup)</a>';
  var t = qS('#userNavigation') || qS('.Dropdown ul') || qS('.gn_topmenulist.gn_topmenulist_set');
  if(t){t.appendChild(k); t.appendChild(k2);}
  if(location.href.indexOf('instagram.com')){
    var o = WebKitMutationObserver || MutationObserver;
    if(o){
      var observer = new o(runLater);
      observer.observe(document.body, {subtree: true, childList: true});
    }
  }
};
function runLater(){clearTimeout(window.addLinkTimer);window.addLinkTimer = setTimeout(addLink, 300);}
function addLink(){
  dFAinit();
  var k = qSA(".mediaPhoto");
  for(var i = 0; i<k.length; i++)_addLink(k[i], k[i]);
  k = qS(".LikeableFrame");
  if(k)_addLink(k, qS(".Info .followButtonActions"));
}
function _addLink(k, target){
  if(!target || (target.nextElementSibling && target.nextElementSibling.classList.contains("dLink")))return;
  var t = k.querySelector("div");
  if(t){
    var link = document.createElement('div');
    link.className = "timelineLikeList dLink";
    link.innerHTML = "<a href='" + t.getAttribute("src") + "' download class='llNameLink' title='(provided by Download FB Album mod)'>Download</a>";
    target.insertAdjacentElement("afterEnd", link);
  }
}
document.addEventListener("DOMContentLoaded", dFAinit, false);
setTimeout(dFAinit, 2000);
var g = {};
function getParent(child, selector){
  var target = child;
  while(target && !target.querySelector(selector) && target.parentNode != document.body){
    target = target.parentNode;
  }
  return target ? target.querySelector(selector) : null;
}
function getText(s, html){
  var q = qSA(s)[0], t = 'textContent';
  if(q && q.querySelectorAll('br').length){t = 'innerHTML';}
  if(q && html && q.querySelectorAll('a').length){t = 'innerHTML';}
  return q ? q[t] : "";
}
function getDOM(html){
  var doc;
  if(document.implementation){
    doc = document.implementation.createHTMLDocument('');
    doc.documentElement.innerHTML = html;
  }else if(DOMParser){
    doc = (new DOMParser).parseFromString(html, 'text/html');
  }else{
    doc = document.createElement('div');
    doc.innerHTML = html;
  }
  return doc;
}
function parseTime(t){return new Date(t*1000+g.timeOffset).toJSON().replace('T',' ').split('.')[0];}
function parseQuery(s){
  var data = {};
  var n = s.split("&");
  for(var i=0; i<n.length; i++){
    var t = n[i].split("=");
    data[t[0]] = t[1];
  }
  return data;
}
function output(){
  if(location.href.match(/.*facebook.com/)){
    document.title = document.title.match(/(?:.*\|\|)*(.*)/)[1];
    var photos = g.photodata.photos;
    for(var i=0; i<photos.length;i++){
      try{
        var id = photos[i].href.match(/fbid=(.*)/);
        if(!id)id = photos[i].href.match(/\/(\d+)\//);
        id = id[1];
        if(g.commentsList[id])photos[i].comments = g.commentsList[id];
      }catch(e){}
      delete photos[i].ajax;
    }
    var t=g.statusEle;
    t.innerHTML=g.statusText;
    var b=qS('#stopAjax');
    if(b){t.parentNode.removeChild(b);}
  }else if(location.href.match(/.*instagram.com/)){
    g.status.e.textContent = g.status.t;
    var ajaxCkb = qS('#stopAjax');
  }
  if(ajaxCkb)ajaxCkb.parentNode.removeChild(ajaxCkb);
  document.title=g.photodata.aName;
  if(g.photodata.photos.length>1000 && !g.largeAlbum){
    if(confirm('Large amount of photos may crash the browser:\nOK->Use Large Album Optimize Cancel->Continue'))g.photodata.largeAlbum = true;
  }
  sendRequest({type:'export',data:g.photodata});
}
function fbAjax(){
  var len=g.photodata.photos.length,i=g.ajaxLoaded;
  var src=g.photodata.photos[i].href;
  src=src.split("&")[0];src=src.slice(src.indexOf("=")+1);
  if(g.dataLoaded[src]!==undefined){
    var t=g.dataLoaded[src];
    g.photodata.photos[i].title=t.title;
    g.photodata.photos[i].tag=t.tag;
    g.photodata.photos[i].date=t.date;
    delete g.dataLoaded[src];
    g.ajaxLoaded++;
    if(len<50||i%15==0)console.log('Loaded '+(i+1)+' of '+len+'. (cached)');
    g.statusEle.textContent='Loading '+(i+1)+' of '+len+'.';
    if(i+1!=len){document.title="("+(i+1)+"/"+(len)+") ||"+g.photodata.aName;fbAjax();
    }else{output();}
  }else if(!qS('#stopAjaxCkb')||!qS('#stopAjaxCkb').checked){
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    clearTimeout( g.timeout );
    var r=this.response,htmlBase=document.createElement('html');
    htmlBase.innerHTML=r.slice(6,-7);
    var targetJS=htmlBase.querySelectorAll('script'),list=[src];
    for(var k=0;k<targetJS.length;k++){
      var t=targetJS[k].textContent,content=t.slice(t.indexOf('(2, {')+4,t.indexOf('}, true);}')+1);
      if(!content.length||t.indexOf('JSONPTransport')<0){continue;}
      content=JSON.parse(content);
      var require=content.payload.jsmods.require;
      if(require&&(content.id=='pagelet_photo_viewer'||require[0][1]=='addPhotoFbids')){list=require[0][3][0];}
      if(t.indexOf('fbPhotosPhotoTagboxBase')>0||t.indexOf('fbPhotosPhotoCaption')>0){
        var markup=content.payload.jsmods.markup;
        for(var ii=0;ii<markup.length;ii++){
          var markupContent=markup[ii];
          for(var j=0;j<markupContent.length;j++){
            var test=markupContent[j].__html;
            if(!test){continue;}
            var h=document.createElement('div');h.innerHTML=unescape(test);
                        var c=h.querySelectorAll(".fbPhotosPhotoCaption");
                        var b=h.querySelectorAll(".fbPhotosPhotoTagboxes");
                        var a=h.querySelectorAll("abbr");
            if(!c.length){continue;}
            for(var kk=0;kk<c.length;kk++){
              var s=c[kk].querySelector(".hasCaption");
              s=!s?'':s.innerHTML.match(/<br>|<wbr>/)?s.outerHTML.replace(/'/g,'&quot;'):s.textContent;
              var tag=b[kk].querySelector('.tagBox');
              tag=!tag?'':b[kk].outerHTML;
              var date=(a&&a[kk])?parseTime(a[kk].dataset.utime):'';
              g.dataLoaded[list[kk]]={tag:tag,title:s,date:date};
            }
          }
        }
      };
      var instances = content.payload.jsmods.instances;
      for(var ii=0; instances && ii<instances.length; ii++){
        if(!instances[ii] || !instances[ii].length || !instances[ii][1])continue;
        if(instances[ii] && instances[ii].length>2 && instances[ii][1].length && instances[ii][1][0]=="UFIController"){
          var inst = instances[ii][2];
          if(inst.length && inst[2].comments && inst[2].comments.length){
            var comments = inst[2].comments, profiles = inst[2].profiles;
            var commentsList = [inst[2].feedbacktargets[0].commentcount];
            var fbid = comments[0].ftentidentifier;
            var timeFix = new Date(parseTime(inst[2].servertime))-new Date();
            for(var j=0; j<profiles.length; j++){
              try{
                var p = profiles[j];
                g.profilesList[p.id] = {name: p.name, url: p.uri};
              }catch(e){}
            }
            for(var j=0; j<comments.length; j++){
              try{
                var c = comments[j], p = g.profilesList[c.author];
                commentsList.push({fbid: fbid,id: c.legacyid, name: p.name, url: p.url, text: c.body.text, date: parseTime(c.timestamp.time)})
              }catch(e){}
            }
            g.commentsList[fbid] = commentsList;
            g.commentsList.count++;
          }
        }
      };
    }
    if(g.dataLoaded[src]!==undefined){
      var t=g.dataLoaded[src];
      g.photodata.photos[i].title=t.title;
      g.photodata.photos[i].tag=t.tag;
      g.photodata.photos[i].date=t.date;
      delete g.dataLoaded[src];
      g.ajaxLoaded++;
    }
    if(len<50||i%15==0)console.log('Loaded '+(i+1)+' of '+len+'.');
    var t=g.statusEle;
    if(!t.nextElementSibling){var stopBtn=document.createElement('label');stopBtn.id='stopAjax';stopBtn.innerHTML='<a class="navItem"> | Stop</a><input id="stopAjaxCkb" type="checkbox">';t.parentNode.appendChild(stopBtn);}
    t.textContent='Loaded '+(i+1)+' of '+len+'.';
    if(i+1==len||g.ajaxRetry==1){output();}else{if(i==g.ajaxLoaded){g.ajaxRetry++};
    document.title="("+(i+1)+"/"+(len)+") ||"+g.photodata.aName;fbAjax();}
  };
  xhr.open("GET", g.photodata.photos[i].ajax);
  g.timeout=setTimeout(function(){
    xhr.abort();
    g.ajaxRetry++;
    if(g.ajaxRetry>5){if(confirm('Timeout reached.\nTry again->OK\nOutput loaded photos->Cancel')){g.ajaxRetry=0;fbAjax();}else{output();}}
  },10000);
  xhr.send();}else{output();}
}
function getPhotos(){
  if(g.start!=2||g.start==3){return;}
  var scrollEle = !!(qS('#fbTimelinePhotosScroller *')||qS('.uiSimpleScrollingLoadingIndicator')||qS('.fbStarGrid~img')||qS("#browse_result_below_fold"));
  if(g.ajaxFailed&&g.mode!=2&&scrollEle){scrollTo(0, document.body.clientHeight);setTimeout(getPhotos,2000);return;}
  var i,elms=g.elms||qS('#album_pagelet')||qS('#static_set_pagelet')||qS('#pagelet_photos_stream')||qSA('.fbStarGrid')||qS('#group_photoset'),
  photodata=g.photodata,testNeeded=0,ajaxNeeded=0;
  if(g.elms){ajaxNeeded=1;}
  else if(elms.length){
    if(elms.length>1){
      var tmp = [];
      for(var eLen = 0; eLen<elms.length; eLen++){
        var tmpE = elms[eLen].querySelectorAll('a.uiMediaThumb[ajaxify]');
        for(var tmpLen = 0; tmpLen<tmpE.length; tmpLen++){
          tmp.push(tmpE[tmpLen]);
        }
      }
      elms = tmp; ajaxNeeded=1;
    }else{elms=elms[0].querySelectorAll('a.uiMediaThumb[ajaxify]');ajaxNeeded=1;}
  }
  else{elms=qSA('a:not(.notifMainLink):not(.hidden_elem):not(.egoPhotoImage):not(.uiBlingBox):not(.tickerFullPhoto):not(.pronoun-link):not(.uiVideoLink):not([class*="emuEventfad"])[rel="theater"][ajaxify]');testNeeded=1;}
  if(qSA('.fbPhotoStarGridElement')){ajaxNeeded=1;}
  if(g.mode!=2&&!g.lastLoaded&&scrollEle&&(!qS('#stopAjaxCkb')||!qS('#stopAjaxCkb').checked)){
    fbAutoLoad(elms);return;
  }
  for (i = 0;i<elms.length;i++) {
    var test1 = (getParent(elms[i],'.mainWrapper')&&getParent(elms[i],'.mainWrapper').querySelector('.shareSubtext')&&elms[i].childNodes[0]&&elms[i].childNodes[0].tagName=='IMG');
    var test2 = (getParent(elms[i],'.timelineUnitContainer')&&getParent(elms[i],'.timelineUnitContainer').querySelector('.shareUnit'));
    var test3 = (elms[i].querySelector('img')&&!elms[i].querySelector('img').scrollHeight);
    if(testNeeded&&(test1||test2||test3)){continue;}
    try{
    var url=unescape(elms[i].getAttribute('ajaxify')), href = elms[i].href;
    if(!g.notLoadCm){
      var ajax=url.slice(url.indexOf("?")+1,url.indexOf("&src")).split("&");
      var q={};for(var j=0;j<ajax.length;j++){var d=ajax[j].split("=");q[d[0]]=d[1];}
      ajax=location.protocol+'//www.facebook.com/ajax/pagelet/generic.php/PhotoViewerInitPagelet?ajaxpipe=1&ajaxpipe_token='+g.Env.ajaxpipe_token+'&no_script_path=1&data='+JSON.stringify(q)+'&__user='+g.Env.user+'&__a=1&__adt=2';
    }
    url=url.match(/&src.(.*)/)[1].replace("s720x720/","").replace(/&smallsrc=.*\?/, '?');
    if(url.match(/\?/)){
      var b=url.split('?'), t='', a=b[1].split('&');
      for(var ii=0;ii<a.length;ii++){
        if(a[ii].match(/oh|oe|__gda__/))t+=a[ii]+'&';
      }
      url = b[0] + (t.length?('?'+t.slice(0, -1)):'');
    }else{url=url.slice(0, url.indexOf('&'));}
    if(href.match('&'))href=href.slice(0, href.indexOf('&'));
    if(!g.downloaded[url]){g.downloaded[url]=1;}else{continue;}
    var title = elms[i].getAttribute('title')||elms[i].querySelector('img')?elms[i].querySelector('img').getAttribute('alt'):''||'';
    title=title.indexOf(' ')>0?title:'';
    title=title.indexOf(': ')>0||title.indexOf('： ')>0?title.slice(title.indexOf(' ')+1):title;
    if(!title){
    var t=getParent(elms[i],'.timelineUnitContainer')||getParent(elms[i],'.mainWrapper');
    if(t){var target1=t.querySelectorAll('.fwb').length>1?'':t.querySelector('.userContent');}
    var target2=elms[i].getAttribute('aria-label')||'';
    if(target2){title=target2;}
    if(title===''&&target1){title=target1.innerHTML.match(/<br>|<wbr>/)?target1.outerHTML.replace(/'/g,'&quot;'):target1.textContent;}
    }
    var newPhoto={url: url, href: href};
    newPhoto.title=title;
    if(!g.notLoadCm)newPhoto.ajax=ajax;
    photodata.photos.push(newPhoto);
    }catch(e){continue;}
  }
  if(qS('#stopAjaxCkb')&&qS('#stopAjaxCkb').checked){qS('#stopAjaxCkb').checked=false;}
  console.log('export '+photodata.photos.length+' photos.');
  if(!g.notLoadCm){
    if(ajaxNeeded&&(g.loadCm||confirm("Try to load photo's caption?"))){fbAjax();}else{output();}
  }else{output();}
}
function fbAutoLoad(elms){
  var l; if(g.ajaxStartFrom){
    l=g.ajaxStartFrom;
  }else{
    l = elms[elms.length-1].href;
    try{
      l = l.match(/fbid=(\d+)/);
      if(!l)l = l.slice(l.indexOf('=')+1,l.indexOf('&'));
      else l = l[1];
    }catch(e){alert("Autoload failed!");g.lastLoaded=1;getPhotos();}
  }
  if(!g.last_fbid){
    g.last_fbid = l;
  }else if(g.last_fbid==l){
    if(g.ajaxRetry<5){l=elms[elms.length-2].href;l=l.slice(l.indexOf('=')+1,l.indexOf('&'));g.ajaxRetry++;}
    else if(confirm('Reaches end of album / Timeouted.\nTry again->OK\nOutput loaded photos->Cancel')){g.ajaxRetry=0;}else{g.lastLoaded=1;getPhotos();return;}
  }else{
    g.last_fbid=l;
  }
  var p=location.href+'&';var isAl=p.match(/media\/set|set=a/),aInfo={},isPS=p.match(/photos_stream/),isGp=p.match(/group/),isGraph=p.match(/search/);
  if(isGp){
    p=elms[0].href.split('&')[1];p=p.slice(p.indexOf('.')+1)
    aInfo={"scroll_load":true,"last_fbid":l,"fetch_size":108,"group_id":p};
  }else if(isAl){
    p=p.match(/set=([a\.\d]*)&/)[1] || p.slice(p.indexOf('=')+1,p.indexOf('&'));
    aInfo={"scroll_load":true,"last_fbid":l,"fetch_size":32,"profile_id":+p.slice(p.lastIndexOf('.')+1),"viewmode":null,"set":p,"type":"1"};
  }else if(isGraph){
    var query = {};
    if(!g.query){
      var s=qSA("script"), temp=[];
      try{
        for(var i=0;i<s.length;i++){
          if(s[i].textContent.indexOf('encoded_query')>0){temp[0]=s[i].textContent;}
          if(s[i].textContent.indexOf('cursor')>0){temp[1]=s[i].textContent;}
          if(temp.length==2)break;
        }
        query = temp[0];
        query = JSON.parse(query.slice(query.indexOf("(")+1, query.lastIndexOf(")")));
        
        var cursor = temp[1];
        cursor = JSON.parse(cursor.slice(cursor.indexOf("(")+1, cursor.lastIndexOf(")")));
      }catch(e){
        console.log(e);
        fbAutoLoadFailed();
        return;
      }
      var rq = query.jsmods.require;
      for(i=0; i<rq.length; i++){
        if(rq[i][0] == "BrowseScrollingPager"){
          query = rq[i][3][1];
          break;
        }
      }
      rq = cursor.jsmods.require;
      for(i=0; i<rq.length; i++){
        if(rq[i][0] == "BrowseScrollingPager"){
          cursor = rq[i][3][0].cursor;
          break;
        }
      }
      query.cursor = cursor;
      query.ads_at_end = false;
      g.query = query;
    }else{
      query = g.query;
      query.cursor = g.cursor;
    }
    aInfo = query;
  }else if(!g.newL){
    p=JSON.parse(qS('#pagelet_timeline_main_column').dataset.gt).profile_owner;
    aInfo={"scroll_load":true,"last_fbid":l,"fetch_size":32,"profile_id":+p,"tab_key":"photos"+(isPS?'_stream':''),"sk":"photos"+(isPS?'_stream':'')};
  }else{
    p = qS('#pagelet_timeline_medley_photos a[aria-selected="true"]').getAttribute('aria-controls').match(/.*_(.*)/)[1];
    var userId = p.match(/(\d*):.*/)[1];
    var tab = p.split(':')[2];
    if(qS('.hidden_elem .fbStarGrid')){
      var t=qS('.hidden_elem .fbStarGrid');t.parentNode.removeChild(t);getPhotos();return;
    }
    aInfo={"scroll_load":true,"last_fbid":l,"fetch_size":32,"profile_id":userId,"tab_key":"photos"+(tab==5?'_stream':''),"sk":"photos"+(tab==5?'_stream':'')};
  }
  var ajaxAlbum = '';
  if(isGraph){
    ajaxAlbum=location.protocol+'//www.facebook.com/ajax/pagelet/generic.php/BrowseScrollingSetPagelet?data='+escape(JSON.stringify(aInfo))+'&__user='+g.Env.user+'&__a=1';
  }else if(!g.newL || isGp || isAl){
    var targetURL=(isGp?'GroupPhotoset':'TimelinePhotos'+(isAl?'Album':(isPS?'Stream':'')));
    ajaxAlbum=location.protocol+'//www.facebook.com/ajax/pagelet/generic.php/'+targetURL+'Pagelet?ajaxpipe=1&ajaxpipe_token='+g.Env.ajaxpipe_token+'&no_script_path=1&data='+JSON.stringify(aInfo)+'&__user='+g.Env.user+'&__a=1&__adt=2';
  }else{
    var req = 5+(qSA('.fbStarGrid>div').length-8)/8*2
    var tab=qSA('#pagelet_timeline_medley_photos a[aria-role="tab"]');
    var pType = +p.split(':')[2], targetURL = "";
    switch(pType){
      case 4: targetURL = 'TimelinePhotos'; break;
      case 5: targetURL = 'TimelinePhotosStream'; break;
      case 70: targetURL = "UntaggedPhotosAppCollection";
      cursor = btoa('0:not_structured:'+l);
      aInfo = {"collection_token": p, "cursor": cursor, "tab_key": "photos_untagged","profile_id": +userId,"overview":false,"ftid":null,"sk":"photos"}; break;
    }
    ajaxAlbum=location.protocol+'//www.facebook.com/ajax/pagelet/generic.php/'+targetURL+'Pagelet?data='+escape(JSON.stringify(aInfo))+'&__user='+g.Env.user+'&__a=1';
  }
  var xhr = new XMLHttpRequest();
  xhr.onload = function(){
    clearTimeout( g.timeout );
    if(this.status!=200){
      if(!confirm('Autoload failed.\nTry again->OK\nOutput loaded photos->Cancel')){g.lastLoaded=1;}getPhotos();return;
    }
    var r=this.response,htmlBase=document.createElement('html');
    var newL = r.indexOf('for')==0;

    var eCount=0;
    if(!newL){
      htmlBase.innerHTML=r.slice(6,-7);
      var targetJS=htmlBase.querySelectorAll('script');
      for(var k=0;!newL && k<targetJS.length;k++){
        var t=targetJS[k].textContent,content=t.slice(t.indexOf(', {')+2,t.indexOf('}, true);}')+1);
        if(!content.length||t.indexOf('JSONPTransport')<0){continue;}
        content=JSON.parse(content);
        var d=document.createElement('div');
        d.innerHTML=content.payload.content.content;
        var e=d.querySelectorAll('a.uiMediaThumb[ajaxify]');
        if(!e||!e.length)continue;
        eCount+=e.length;
        var old=elms?Array.prototype.slice.call(elms,0):'';
        g.elms=old?old.concat(Array.prototype.slice.call(e,0)):e;
      }
    }else{
      htmlBase.innerHTML = JSON.parse(r.slice(9)).payload;
      var e;
      if(g.query){
        e = htmlBase.querySelectorAll('a[ajaxify]');
        if(e.length)g.cursor = parseQuery(e[e.length-1].href).opaqueCursor;
      }else{
        e = htmlBase.querySelectorAll('a.uiMediaThumb[ajaxify]');
      }
      eCount+=e.length;
      var old=elms?Array.prototype.slice.call(elms,0):'';
      g.elms=old?old.concat(Array.prototype.slice.call(e,0)):e;
    }
    var t=g.statusEle;
    if(!t.nextElementSibling){var stopBtn=document.createElement('label');stopBtn.id='stopAjax';stopBtn.innerHTML='<a class="navItem"> | Stop</a><input id="stopAjaxCkb" type="checkbox">';t.parentNode.appendChild(stopBtn);}
    t.textContent='Loading album... ('+g.elms.length+')';
    document.title='('+g.elms.length+') ||'+g.photodata.aName;

    if(!eCount){console.log('Loaded '+g.elms.length+' photos.');g.lastLoaded=1;}
    if(g.ajaxStartFrom){
      for(var a=0;a<g.elms.length;a++){
        if(g.elms[a].id.indexOf(g.ajaxStopAt)>-1){g.lastLoaded=1;break;}
      }
      var l=g.elms[g.elms.length-1].href;
      g.ajaxStartFrom=l.slice(l.indexOf('=')+1,l.indexOf('&'));
    }
    setTimeout(getPhotos,1000);
  }
  xhr.open("GET", ajaxAlbum);
  g.timeout=setTimeout(function(){
    xhr.abort();
    if(g.ajaxRetry>5){if(confirm('Timeout reached.\nTry again->OK\nOutput loaded photos->Cancel')){g.ajaxRetry=0;}else{g.lastLoaded=1;}}getPhotos();
  },10000);
  xhr.send();
}
function instaAjax(){
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var total=g.total, photodata=g.photodata,
    res=JSON.parse(this.response),elms=res.items;
    if(elms[0].id.indexOf('_')<0)elms=elms[3];
    g.ajax=res.more_available?elms[elms.length-1].id:null;
    for(var i=0;i<elms.length;i++){
      var j=null,url=elms[i].images.standard_resolution.url;
      g.stored.forEach(function(v,k){if(v==url)j=k;});j=!j?photodata.photos.length:j;
      var c = elms[i].comments, cList = [c.count];
      for(var k=0; k<c.data.length; k++){
        var p = c.data[k];if(p){
        cList.push({name: p.from.full_name || p.from.username, url: 'http://instagram.com/'+p.from.username, text: p.text, date: parseTime(p.created_time), id: elms[i].link});}
      }
      photodata.photos[j]={
      title: elms[i].caption?elms[i].caption.text:'',
      url: url,
      href: elms[i].link,
      date: elms[i].created_time?parseTime(elms[i].created_time):'',
      comments: c.count?cList:''
      };
    }
    console.log('Loaded '+photodata.photos.length+' of '+total+' photos.');
    if(!g.status.e.nextElementSibling){var stopBtn=document.createElement('label');stopBtn.id='stopAjax';stopBtn.innerHTML='<a class="navItem"> | Stop</a><input id="stopAjaxCkb" type="checkbox">';g.status.e.parentNode.appendChild(stopBtn);}
    g.status.e.textContent='Loaded '+g.photodata.photos.length+' / '+total;
    document.title="("+g.photodata.photos.length+"/"+total+") ||"+g.photodata.aName;
    if(qS('#stopAjaxCkb')&&qS('#stopAjaxCkb').checked){output();}
    else if(total>photodata.photos.length&&g.ajax){instaAjax();}else{output();}
  }
  xhr.open("GET", 'http://instagram.com/'+g.Env.user.username+'/media?max_id='+g.ajax);
  xhr.send();
}
function getInstagram(){
  if(g.start!=2||g.start==3){return;}g.start=3;
  var i,elms=g.Env.userMedia,photodata=g.photodata;
  for(i=0;i<elms.length;i++){
    var url=elms[i].images.standard_resolution.url;
    g.stored.push(url);
    var c = elms[i].comments, cList = [c.count];
    for(var j=0; j<c.data.length; j++){
      var p = c.data[j];if(p){
      cList.push({name: p.from.full_name || p.from.username, url: 'http://instagram.com/'+p.from.username, text: p.text, date: parseTime(p.created_time), id: elms[i].link});}
    }
    photodata.photos.push({
      title: elms[i].caption?elms[i].caption.text:'',
      url: url,
      href: elms[i].link,
      date: elms[i].created_time?parseTime(elms[i].created_time):'',
      comments: c.count?cList:''
    });
  }
  var elms2=qSA('li.photo');
  if(elms2&&!g.loadCm){ for(i=photodata.photos.length;i<elms2.length;i++){
    var e = elms2[i].querySelector('.Image');
    if(e){var url=e.style.backgroundImage.slice(4,-1).replace('6.jpg','7.jpg');
    g.stored.push(url);
    photodata.photos.push({
      title: '',
      url: url,
      date: elms2[i].querySelector('.photo-date').textContent,
      href: elms2[i].querySelector('a').href||''
    }); }
  }}else if(g.mode==2&&elms2&&g.loadCm){g.total=elms2.length;}
  if((g.mode!=2||g.loadCm)&&photodata.photos.length!=g.total){g.ajax=elms[elms.length-1].id;instaAjax();}else{output();}
}
function getWeibo(){
  if(!GM_xmlhttpRequest){alert("This script required Greasemonkey/Tampermonkey!");return;}
  GM_xmlhttpRequest({
    method: "GET",
    url: "http://photo.weibo.com/page/waterfall?filter=wbphoto&page="+g.ajaxPage+"&count=20&module_id=profile_photo&oid="+g.oId+"&uid=&lastMid="+g.ajax+"&lang=zh-tw",
    onload: function() {
    g.ajaxPage++;
    var r = this.response;
    var s = r.slice( r.indexOf("{"),r.lastIndexOf("}")+1 );
    var res = new Function("return " + s)().data;
    var elms = res.html;
    var photodata=g.photodata;
    var html;
    g.ajax=res.lastMid || null;
    for(var i=0;elms&&i<elms.length;i++){
      html = document.createElement("div");
      html.innerHTML = elms[i];
      var links = html.querySelectorAll("a.ph_ar_box");
      var img = html.querySelectorAll("img.photo_pic");
      var title = html.querySelector(".describe span").title || '';
      var photoTime = html.querySelector(".photo_time").textContent || '';
      for(var imgCount = 0; imgCount < img.length; imgCount++){
        var data = {};
        var link = links[imgCount].getAttribute("action-data").split("&");
        for(var j=0; j<link.length; j++){
          var t = link[j].split("=");
          data[t[0]] = t[1];
        }
        var url = img[imgCount].src.match(/http:\/\/([\w\.]+)\//);
        url = 'http://' + url[1] + '/large/' + data.pid + '.jpg';
        if(!g.downloaded[url]){g.downloaded[url]=1;}else{continue;}
        photodata.photos.push({
        title: title,
        url: url,
        href: 'http://photo.weibo.com/'+g.uId+'/talbum/detail/photo_id/'+data.mid,
        date: photoTime
        });
      }
    }
    console.log('Loaded '+photodata.photos.length+' photos.');
    document.title="("+g.photodata.photos.length+") ||"+g.photodata.aName;
    if(!qS('#stopAjaxCkb')){var stopBtn=document.createElement('label');stopBtn.id='stopAjax';stopBtn.innerHTML='Stop <input id="stopAjaxCkb" type="checkbox">';qS('.gn_person').appendChild(stopBtn);}
    if(qS('#stopAjaxCkb')&&qS('#stopAjaxCkb').checked){output();}
    else if(g.ajax){setTimeout(getWeibo, 2000);}else{output();}
  }
  });
}
unsafeWindow.dFAcore = function(setup) {
  g.start=1;g.settings={};
  if(!setup&&localStorage['dFASetting']){g.settings=localStorage['dFASetting']?JSON.parse(localStorage['dFASetting']):{};}
  g.mode=g.settings.mode||window.prompt('Please type your choice:\nNormal: 1/press Enter\nDownload without auto load: 2\nAutoload start from specific id: 3\nOptimization for large album: 4')||1;
  if(g.mode==null){return;}
  if(g.mode==3){g.ajaxStartFrom=window.prompt('Please enter the fbid:\ni.e. 123456 if photo link is:\nfacebook.com/photo.php?fbid=123456');if(!g.ajaxStartFrom){return;}}
  if(g.mode==4){g.largeAlbum=true;g.mode=window.prompt('Please type your choice:\nNormal: 1/press Enter\nDownload without auto load: 2\nAutoload start from specific id: 3');}
  g.loadCm=g.settings.notLoadCm?0:(g.settings.loadCm||confirm("Try to load photo's caption?"));
  g.notLoadCm=g.settings.notLoadCm||!g.loadCm;
  g.largeAlbum=g.settings.largeAlbum||g.largeAlbum;
  g.newWin=g.settings.notNewWin?0:(g.settings.newWin||confirm("Open page in new window?"));
  g.notNewWin=g.settings.notNewWin||!g.newWin;
  g.settings={mode:g.mode,loadCm:g.loadCm,largeAlbum:g.largeAlbum,notLoadCm:g.notLoadCm,newWin:g.newWin,notNewWin:g.notNewWin};
  localStorage['dFASetting']=JSON.stringify(g.settings);
  var aName=document.title,aAuth="",aDes="",aTime="";g.start=2;
  g.timeOffset=new Date().getTimezoneOffset()/60*-3600000;
  if(location.href.match(/.*facebook.com/)){
    if(qS('.fbPhotoAlbumTitle')||qS('.fbxPhotoSetPageHeader')){
    aName=getText('.fbPhotoAlbumTitle')||getText("h2")||document.title;
    aAuth=getText("h2")||getText('.fbStickyHeaderBreadcrumb .uiButtonText')||getText(".fbxPhotoSetPageHeaderByline a");
    if(!aAuth){aName=getText('.fbPhotoAlbumTitle'); aAuth=getText('h2');}
    aDes=getText('.fbPhotoCaptionText',1);
    try{aTime=qS('#globalContainer abbr').title;
    var aLoc=qS('.fbPhotoAlbumActionList').lastChild;
    if((!aLoc.tagName||aLoc.tagName!='SPAN')&&(!aLoc.childNodes.length||(aLoc.childNodes.length&&aLoc.childNodes[0].tagName!='IMG'))){aLoc=aLoc.outerHTML?" @ "+aLoc.outerHTML:aLoc.textContent;aTime=aTime+aLoc;}}catch(e){};
    }
    s = qSA("script");
    try{
      for(i=0,t, len = s.length; t=s[i].textContent, i<len; i++){
        if(t.match(/envFlush\({/)){
          g.Env=JSON.parse(t.slice(t.lastIndexOf("envFlush({")+9,-2)); break;
        }
      }
    }catch(e){alert('Cannot load required variable');}
    try{
      for(i=0; t=s[i].textContent, i<len; i++){
        var m = t.match(/"USER_ID":"(\d+)"/);
        if(m){
          g.Env.user = m[1]; break;
        }
      }
    }catch(e){console.warn(e);alert('Cannot load required variable');}
    g.ajaxLoaded=0;g.dataLoaded={};g.ajaxRetry=0;g.elms='';g.lastLoaded=0;g.ajaxStarted=0;
    g.statusEle = qS('.navItem.middleItem a') || qS('ul[role="navigation"] li:nth-of-type(2) a');
    g.statusText=g.statusEle.innerHTML;g.downloaded={};g.profilesList={};g.commentsList={count:0};
    g.photodata = {
      aName:aName.replace(/'|"/g,'\"'),
      aAuth:aAuth.replace(/'|"/g,'\"'),
      aLink:(window.location+"").split("&")[0],
      aTime:aTime,
      photos: [],
      aDes:aDes,
      largeAlbum:g.largeAlbum
    };
    g.newL = !!(qSA('#pagelet_timeline_medley_photos a[aria-role="tab"]').length);
    getPhotos();
  }else if(location.href.match(/.*instagram.com/)){
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
      var html = this.response;
      var doc = getDOM(html);
      try{
        s=doc.querySelectorAll("script");
        for(i=0;i<s.length;i++){
          if(!s[i].src&&s[i].textContent.indexOf('_sharedData')>0){s=s[i].textContent;break;}
        }
        g.Env=JSON.parse(s.match(/({".*})/)[1]);g.stored=[];
        if(!g.Env.entry_data.UserProfile){
          alert('Need to reload for required variable.');
          location.reload(); return;
        }
      }catch(e){alert('Cannot load required variable!');}
      g.Env = g.Env.entry_data.UserProfile[0];
      var userName = qS("h1 span");
      userName = userName?userName.textContent:"";
      if(userName && userName!=g.Env.user.username){
        alert('Need to reload for required variable.');
        location.reload(); return;
      }
      g.total=g.mode!=2?+qS('.number-stat').textContent.replace(/,/g,""):g.Env.user.counts.media;
      console.log(g.Env);
      aName=g.Env.user.full_name;
      if(!aName)aName='Instagram';
      aAuth=g.Env.user.username;
      aLink=g.Env.user.website;
      if(!aLink)aLink='http://instagram.com/'+aAuth;
      g.status = {e: qS('.link-profile strong') || qS('.loginLink')};
      g.status.t = g.status.e.textContent;
      g.photodata = {
        aName:aName.replace(/'|"/g,'\"'),
        aAuth:aAuth,
        aLink:aLink,
        aTime:'Last Update: '+parseTime(g.Env.userMedia[0].created_time),
        photos: [],
        aDes:g.Env.user.bio.replace(/'|"/g,'\"')
      };
      getInstagram();
    };
    xhr.open('GET', location.href);
    xhr.send();
  }else if(location.href.match(/weibo.com/)){
    try{
      aName='微博配圖';
      aAuth=(qS('.name') || qS('.username strong')).textContent
    }catch(e){}
    g.downloaded = {};
    var k = qSA('script'), id = '';
    for(var i=0; i<k.length && !id.length; i++){
      var t = k[i].textContent.match(/\$CONFIG\['oid'\]/);
      if(t)id = k[i].textContent;
    }
    eval(id);
    if(!$CONFIG){alert("發生錯誤，請聯絡作者");return;}
    g.oId = $CONFIG.page_id || $CONFIG.oid;
    g.ajaxPage = 1;
    g.ajax = ""
    g.photodata = {
      aName:aName,
      aAuth:aAuth,
      aLink:location.href,
      aTime:aTime,
      photos: [],
      aDes:""
    };
    getWeibo();
  }
};
function sendRequest(request, sender, sendResponse) {
switch(request.type){
  case 'store':
    localStorage["downFbAlbum"]=request.data;
    console.log(request.no+' photos data saved.'); break;
  case 'get':
    g.photodata=JSON.parse(localStorage["downFbAlbum"]);
    g.start=2;
    console.log(g.photodata.photos.length+' photos got.');
    getPhotos();
    break;
  case 'export':
    if(!request.data){request.data=JSON.parse(localStorage["downFbAlbum"]);}
    console.log('Exported '+request.data.photos.length+' photos.');
    var a,b=[],c=request.data;
    c.aName=(c.aName)?c.aName:"Facebook";
    var d = c.photos,totalCount = d.length;
    for (var i=0;i<totalCount;i++) {
      if(d[i]){
      var href=d[i].href?d[i].href:'',title=d[i].title||'',tag=d[i].tag||'',comments=d[i].comments||'',tagIndi='',dateInd='',commentInd='';
      href=href?' href="'+href+'" target="_blank"':'';
      if(tag){
        tag='<div class="loadedTag">'+tag+'</div>';
        tagIndi='<i class="tagArrow tagInd"></i>';
      }
      if(comments){
        var co ='<div class="loadedComment">';
        if(comments[0]>comments.length-1){
          var cLink = comments[1].fbid ? ("https://www.facebook.com/photo.php?fbid="+comments[1].fbid) : comments[1].id;
          co += '<p align="center"><a href="'+cLink+'" target="_blank">View all '+comments[0]+' comments</a></p>';
        }
        for(var ii=1; ii<comments.length; ii++){
          var p = comments[ii];
          co += '<blockquote><p>'+p.text+'</p><small><a href="'+p.url+'" target="_blank">'+p.name+'</a> '+(p.fbid?('<a href="https://www.facebook.com/photo.php?fbid='+p.fbid+'&comment_id='+p.id+'" target="_blank">'):'')+p.date+(p.fbid?'</a>':'')+'</small></blockquote>';
        }
        comments = co + '</div>';
        commentInd='<a title="Click to view comments" rel="comments"><i class="tagArrow commentInd"></i></a>';
      }
      if(d[i].date){dateInd='<div class="dateInd"><span>'+d[i].date+'</span> <i class="tagArrow dateInd"></i></div>';}
      var $t = [];
      var test = false;
      var test2 = false;
      try{if(title.match(/<.*>/))$t = $(title);}catch(e){}
      try{test = title.match(/hasCaption/) && $t.length;}catch(e){}
      try{test2 = title.match(/div/) && title.match(/span/)}catch(e){}
      try{
        if(test){
          var t=document.createElement('div');
          t.innerHTML=title;
          var junk=t.querySelector('.text_exposed_hide');
          if(junk&&junk.length)t.removeChild(junk);
          title = $t.html();
          if(title.indexOf("<br>") == 0)title = title.slice(4);
        }else if(test2){
          title = title.replace(/&(?!\w+([;\s]|$))/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
        else if($t.length){
          try{
            $t.find('.text_exposed_hide').remove().end()
            .find('div *').unwrap().end()
            .find('.text_exposed_show').unwrap().end()
            .find('span').each(function() {$(this).replaceWith(this.childNodes);});
            title=$t.html();
          }catch(e){}
        }
      }catch(e){}
      title=title?'<div class="captions"><a class="captions" rel="captions"></a>'+title+'</div>':'<div class="captions"></div>';
      var a = '<div rel="gallery" class="item'+(c.largeAlbum?' largeAlbum':'')+'" id="item'+i+'"><a'+href+'>'+(i*1+1)+'</a>'+commentInd+tagIndi+dateInd+'<a class="fancybox" rel="fancybox" href="'+d[i].url+'" target="_blank"><div class="crop"><div style="background-image: url('+d[i].url+');" class="img"><img src="'+d[i].url+'"></div></div></a>'+title+tag+comments+'</div>';
      b.push(a)}
    }
    var tHTML='<!DOCTYPE><html><body class="index">'+'<script>document.title=\''+c.aAuth+(c.aAuth?"-":"")+c.aName+'\';</script>';
    tHTML=tHTML+'<style>body{line-height:1;background:#f5f2f2;font-size:13px;color:#444;padding-top:70px;}.crop{width:192px;height:192px;overflow:hidden;}.crop img{display:none;}.img{width:192px;height:192px;background-size:cover;background-position:50% 25%;border:none;image-rendering:optimizeSpeed;}@media screen and (-webkit-min-device-pixel-ratio:0){.img{image-rendering: -webkit-optimize-contrast;}}header{display:block}.wrapper{width:960px;margin:0 auto;position:relative}#hd{background:#faf7f7;position:fixed;z-index:100;top:0;left:0;width:100%;}#hd .logo{padding:7px 0;border-bottom:1px solid rgba(0,0,0,0.2)}#container{width:948px;position:relative;margin:0 auto}.item{width:192px;float:left;padding:5px 15px 0;margin:0 7px 15px;font-size:12px;background:white;line-height:1.5}.item .captions{color:#8c7e7e;padding-bottom:15px;overflow:hidden;height:8px;position:relative;}.item .captions:first-child{position:absolute;width:100%;height:100%;top:0;left:0;z-index:1;}#logo{background-color:#3B5998;color:#FFF}#hd .logo h1{background-color:#3B5998;left:0;position:relative;width:100%;display:block;margin:0;color:#FFF;height:100%;font-size:20px}#logo a{color:#FFF}#logo a:hover{color:#FF9}progress{width:100%}#aDes{line-height:1.4;}.largeAlbum>a{visibility:visible;}.largeAlbum .fancybox{visibility:hidden;display:none;}.oImg{background-color:#FFC}\
      /* drag */ #output{display:none;background:grey;min-height:200px;margin:20px;padding:10px;border:2px dotted#fff;text-align:center;position:relative;-moz-border-radius:15px;-webkit-border-radius:15px;border-radius:15px;}#output:before{content:"Drag and Drop images.";color:#fff;font-size:50px;font-weight:bold;opacity:0.5;text-shadow:1px 1px#000;position:absolute;width:100%;left:0;top:50%;margin:-50px 0 0;z-index:1;}#output img{display:inline-block;margin:0 10px 10px 0;} button{display:inline-block;vertical-align:baseline;outline:none;cursor:pointer;text-align:center;text-decoration:none;font:700 14px/100% Arial, Helvetica, sans-serif;text-shadow:0 1px 1px rgba(0,0,0,.3);color:#d9eef7;border:solid 1px #0076a3;-webkit-border-radius:.5em;-moz-border-radius:.5em;background-color:#59F;border-radius:.5em;margin:0 2px 12px;padding:.5em 1em .55em;}.cName{display:none;}#fsCount{position: absolute;top: 20;right: 20;font-size: 3em;}\
      /*! fancyBox v2.1.3 fancyapps.com | fancyapps.com/fancybox/#license */\
      .fancybox-wrap,.fancybox-skin,.fancybox-outer,.fancybox-inner,.fancybox-image,.fancybox-wrap iframe,.fancybox-wrap object,.fancybox-nav,.fancybox-nav span,.fancybox-tmp{border:0;outline:none;vertical-align:top;margin:0;padding:0;}.fancybox-wrap{position:absolute;top:0;left:0;z-index:8020;}.fancybox-skin{position:relative;background:#f9f9f9;color:#444;text-shadow:none;-webkit-border-radius:4px;-moz-border-radius:4px;border-radius:4px;}.fancybox-opened{z-index:8030;}.fancybox-outer,.fancybox-inner{position:relative;}.fancybox-type-iframe .fancybox-inner{-webkit-overflow-scrolling:touch;}.fancybox-error{color:#444;font:14px/20px "Helvetica Neue",Helvetica,Arial,sans-serif;white-space:nowrap;margin:0;padding:15px;}.fancybox-image,.fancybox-iframe{display:block;width:100%;height:100%;}.fancybox-image{max-width:100%;max-height:100%;}#fancybox-loading,.fancybox-close,.fancybox-prev span,.fancybox-next span{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAACYBAMAAABt8RZRAAAAMFBMVEUAAAABAQEiIiIjIyM4ODhMTExmZmaCgoKAgICfn5+5ubnW1tbt7e3////+/v4PDw+0IcHsAAAAEHRSTlP///////////////////8A4CNdGQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAphJREFUSMftlE1oE0EUgNeCICru0YunaVNNSj3kbim5SqUECh7MxZMUvPQgKBQPggrSSy9SdFVC8Q8XwbNLpWhByRJQE5vsvimIFjxss14KmnTj/GR+Nrs9WH9OeZdlP96+nXnzvjG6qWHsDb+sVJK4AzSqfbgN767PXHimOMfu2zxCaPgujuGoWUA0RuyWjt0y4pHDGm43kQi7qvDF1xKf3lDYWZT4OJZ426Nfl1GO1nIk/tEgr9BEFpCnVRW4XSev87AEn8izJHHnIy1K9j5HnlMtgY98QCydJqPxjTi2gP4CnZT4MC2SJUXoOk/JIodqLHmJpatfHqRFCWMLnF+JbcdaRFmabcvtfHfPy82Pqs2HVlninKdadUw11tIauz+Y69ET+jGECyLdauiHdiB4yOgsvq/j8Bw8KqCRK7AWH4h99wAqAN/6p2po1gX/cXIGQwOZfz7I/xBvbW1VEzhijrT6cATNSzNn72ic4YDbcAvHcOQVe+32dBwsi8OB5wpHXkEc5YKm1M5XdfC+woFyZNi5KrGfZ4OzyX66InCHH3uJTqCYeorrTOCAjfdYXeCIjjeaYNNNxlNiJkPASym88566Aatc10asSAb6szvUEXQGXrD9rAvcXucr8dhKagL/5J9PAO1M6ZXaPG/rGrtPHkjsKEcyeFI1tq462DDVxYGL8k5aVbhrv5E32KR+hQFXKmNvGvrJ2941Rv1pU8fbrv/k5mUHl434VB11yFD5y4YZx+HQjae3pxWVo2mQMAfu/Dd3uDoJd8ahmOZOFr6kuYMsnE9xB+Xgc9IdEi5OukOzaynuIAcXUtwZ662kz50ptpCEO6Nc14E7fxEbiaDYSImuEaZhczc8iEEMYm/xe6btomu63L8A34zOysR2D/QAAAAASUVORK5CYII=);}#fancybox-loading{position:fixed;top:50%;left:50%;margin-top:-22px;margin-left:-22px;background-position:0 -108px;opacity:0.8;cursor:pointer;z-index:8060;}#fancybox-loading div{width:44px;height:44px;}.fancybox-close{position:absolute;top:-18px;right:-18px;width:36px;height:36px;cursor:pointer;z-index:8040;}.fancybox-nav{position:absolute;top:0;width:40%;height:100%;cursor:pointer;text-decoration:none;background:transparent url(data:image/png;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==);-webkit-tap-highlight-color:rgba(0,0,0,0);z-index:8040;}.fancybox-prev{left:-30%;}.fancybox-next{right:-30%;}.fancybox-nav span{position:absolute;top:50%;width:36px;height:34px;margin-top:-18px;cursor:pointer;z-index:8040;visibility:hidden;}.fancybox-prev span{left:10px;background-position:0 -36px;}.fancybox-next span{right:10px;background-position:0 -72px;}.fancybox-tmp{position:absolute;top:-99999px;left:-99999px;visibility:hidden;max-width:99999px;max-height:99999px;overflow:visible!important;}.fancybox-overlay{position:absolute;top:0;left:0;overflow:hidden;display:none;z-index:8010;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjY3NjM0OUJFNDc1MTFFMTk2RENERUM5RjI5NTIwMEQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjY3NjM0OUNFNDc1MTFFMTk2RENERUM5RjI5NTIwMEQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCNjc2MzQ5OUU0NzUxMUUxOTZEQ0RFQzlGMjk1MjAwRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCNjc2MzQ5QUU0NzUxMUUxOTZEQ0RFQzlGMjk1MjAwRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgbXtVkAAAAPSURBVHjaYhDg4dkAEGAAATEA2alCfCIAAAAASUVORK5CYII=);}.fancybox-overlay-fixed{position:fixed;bottom:0;right:0;}.fancybox-lock .fancybox-overlay{overflow:auto;overflow-y:scroll;}.fancybox-title{visibility:hidden;font:normal 13px/20px "Helvetica Neue",Helvetica,Arial,sans-serif;position:relative;text-shadow:none;z-index:8050;}.fancybox-title-float-wrap{position:absolute;bottom:0;right:50%;margin-bottom:-35px;z-index:8050;text-align:center;}.fancybox-title-float-wrap .child{display:inline-block;margin-right:-100%;background:rgba(0,0,0,0.8);-webkit-border-radius:15px;-moz-border-radius:15px;border-radius:15px;text-shadow:0 1px 2px #222;color:#FFF;font-weight:700;line-height:24px;white-space:nowrap;padding:2px 20px;}.fancybox-title-outside-wrap{position:relative;margin-top:10px;color:#fff;}.fancybox-title-inside-wrap{padding-top:10px;}.fancybox-title-over-wrap{position:absolute;bottom:0;left:0;color:#fff;background:rgba(0,0,0,.8);padding:10px;}.fancybox-inner,.fancybox-lock{overflow:hidden;}.fancybox-nav:hover span,.fancybox-opened .fancybox-title{visibility:visible;}\
      #fancybox-buttons{position:fixed;left:0;width:100%;z-index:8050;}#fancybox-buttons.top{top:10px;}#fancybox-buttons.bottom{bottom:10px;}#fancybox-buttons ul{display:block;width:400px;height:30px;list-style:none;margin:0 auto;padding:0;}#fancybox-buttons ul li{float:left;margin:0;padding:0;}#fancybox-buttons a{display:block;width:30px;height:30px;text-indent:-9999px;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaBAMAAADKhlwxAAAAMFBMVEUAAAAAAAAeHh4uLi5FRUVXV1diYmJ3d3eLi4u8vLzh4eHz8/P29vb////+/v4PDw9Xwr0qAAAAEHRSTlP///////////////////8A4CNdGQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAbVJREFUWMPtlktugzAQhnPNnqLnSRuJXaRGVFm3NmFdPMC+YHqA8NiWBHBdlPgxETRIVatWjIQ0Hn/8DL9lywsxJRYz/T10h+uxkefyiUw6xPROpw33xZHHmm4yTD9WKg2LRHhZqumwuNDW77tQkAwCRTepx2VU5y/LSEMlXkPEc3AUHTJCCESn+S4FOaZa/F7OPqm/bDLyGXCmoR8a4nLkKLrupymiwT/Thz3ZbbWDK9ZPnzxuoMeZ6sSTdKLpGthShnP68EaGIX3MGKGFrx1cAXbQDbR0ypY0TDRdX9JKWtD8RawiZqz8CtMbnR6k1zVsDfod046RP8jnbt6XM/1n6WoSzX2ryLlo+dsgXaRWsSxFV1aDdF4kZjGP5BE0TAPj5vEOII+geJgm1Gz9S5p46RSaGK1fQUMwgabPkzpxrqcZWV/vYA5PE1anDG4nrDw4VpFR0ZDhTtbzLp7p/03LW6B5qnaXV1tL27X2VusX8RjdWnTH96PapbXLuzIe7ZvdxBb9OkbXvtga9ca4EP6c38hb5DymsbduWY1pI2/bcRp5W8I4bXmLnMc08hY5P+/L36M/APYreu7rpU5/AAAAAElFTkSuQmCC);background-repeat:no-repeat;outline:none;opacity:0.8;}#fancybox-buttons a:hover{opacity:1;}#fancybox-buttons a.btnPrev{background-position:5px 0;}#fancybox-buttons a.btnNext{background-position:-33px 0;border-right:1px solid #3e3e3e;}#fancybox-buttons a.btnPlay{background-position:0 -30px;}#fancybox-buttons a.btnPlayOn{background-position:-30px -30px;}#fancybox-buttons a.btnToggle{background-position:3px -60px;border-left:1px solid #111;border-right:1px solid #3e3e3e;width:35px;}#fancybox-buttons a.btnToggleOn{background-position:-27px -60px;}#fancybox-buttons a.btnClose{border-left:1px solid #111;width:35px;background-position:-56px 0;}#fancybox-buttons a.btnDisabled{opacity:0.4;cursor:default;}\
      .loadedTag, .loadedComment{display:none}.fbphotosphototagboxes{z-index:9997}.fancybox-nav{width:10%;}.tagArrow{background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAABgCAMAAADfGilYAAABQVBMVEUAAABXV1dXV1dXV1dXV1dkZGRkZGQAAABXV1dXV1fj4+NXV1cAAAAAAABXV1dXV1cAAABXV1dXV1cdHR1XV1ciIiLi4uJXV1cnJyfl5eVXV1dXV1ff399XV1dXV1dXV1dXV1dXV1dXV1cXFxcAAABXV1dXV1dXV1cAAAA3NzdXV1dXV1dXV1cAAAAAAABXV1dXV1dXV1dXV1cAAAD+/v74+PhXV1dXV1f29vYeHh4tLS0AAAAyMjJXV1f5+flXV1f7+/v///9XV1dtfq9ugLCSn8PO0+Nrfqq9xdqKmL/x8fh1h7COnL5ugK/O1eKTocGkr87O1OTN0+Gnsc7L0eH4+PuRn8Crt85tgK/c4Oyos8+qtc1ugaytuNHx8vnX2+jx8viqtdFzhbOtt9ByhLHX3OiqtdC9xtuKl7/T2ebS2ObSpKIFAAAAQXRSTlMAFCzrgWZAfNNo5fkwLiY8MnLzhWCH49mJ5yp64x5CDo0yw4MG7Xz7Co0G1T5kSmwCk/1g/fcwOPeFiWKLZvn3+z0qeQsAAAJ7SURBVHhendLXctswEAXQJSVbVrdkW457r3FN7WUBkurFvab3/P8HZAGatCIsZ6zcJ2iOLrgYAKBcrrdbrXa9XAZApAX9RAQgaaNOW8lZWedMS11BmagOcKgAiY6VNAJp0DqQhpJWIC2A60CufVHLUBBDaaBOuJtOI5wA/QmOAzk2pr7y4QoBgpOe3pz0kE56eohaoiNlpYa1ipSq8v5b88vXoCE9VPGUuOdSyqZ7Ix1qqFYHwHOcyqeKIw988WpYkRWseQAdKWv4wXE6oVBHyw/1zZ+O/BzuRtG7fafPNJ2m/OiLPNByoCaoEjmyGsxW1VIlIXZIvECopCokyiVVQqnqipaLc0de3Iq8xCPpC142j7BLXM8N5OTXiZI7ZmAgCgYHiVhAJOJBEQ+aeNBkAEcaONLAkQaeCAyCu8XKRUAyNh6PANu6H+cBwBqK82Ar4mC2qFsmjKbF/AKR3QWWgqeCki7YMatL7CELdOeBEMUkdCeuaWvFWhVrM8DQpB3bF7vAkB1LbooCmEQAcyIPBo0TQH4RzOQs8ikb+OzlIDr8bnxogtc8DFlPaDgV/qQs2Jq4RnHWJJtgYV6kRw2imyukBSWvyOqmZFGIt7rTc9swsyZWrZUtMF/IrtiP2ZMMQEFsRrzEvJgDIgMoi3kg4p61PUVsTbJXsAf/kezDhMqOActL06iSYDpL0494gcyrx6YsKxhL4bNeyT7PQmYkhaUXpR55WRpRjdRIdmxi+x9JYGqjRJCB4XvDPYJvMDWWoeU69Aq+2/D/bQpO0Ea8EK0bspNQ2WY60alLisuJ9MMK/GaJ5I/Lt6QKS24obmSpn+kgAJ4gIi70k79vocBUxmfchgAAAABJRU5ErkJggg==);background-size: auto;background-repeat: no-repeat;display: inline-block;height: 11px;width: 20px;background-position: 0 -24px;margin-top:3px;}.tagInd{background-position: 0 -83px;float:right;}.dateInd{background-position:-12px 1px;text-indent:-100%;text-align:right;float:right;}.dateInd span{padding-right:3px;visibility:hidden;}.dateInd:hover span{visibility:visible;}.vis{visibility:visible !important;}.commentInd{background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAGJJREFUKFNjgIGJi47+905fQBCD1EG1MDCABIgBIHVQLSRqmrP2wn8QHo6aeuYdAwugYxiA8cFBDtME04iOYRpBNDSgGVA0YcMwjSiaYABZIVQIBWQ3bsStCcolDhCvgYEBADd1oN6ZvLbPAAAAAElFTkSuQmCC);background-position:0 0;float:right;cursor:pointer;}blockquote {padding: 0 0 0 15px;margin: 0 0 20px;border-left: 5px solid #eeeeee;}blockquote p {margin-bottom: 0;line-height: 1.25;}blockquote small {display: block;line-height: 20px;color: #999999;font-size: 85%;}blockquote small:before {content: "— ";}\
      /* .borderTagBox & .innerTagBox */\
      .fbPhotosPhotoTagboxes{height:100%;left:0;position:absolute;top:0;width:100%;/*pointer-events:none*/}.fbPhotosPhotoTagboxes .tagsWrapper{display:inline-block;height:100%;width:100%;position:relative;vertical-align:middle}.fbPhotosPhotoTagboxBase{line-height:normal;position:absolute}.imageLoading .fbPhotosPhotoTagboxBase{display:none}/*.fbPhotosPhotoTagboxBase .borderTagBox, .fbPhotosPhotoTagboxBase .innerTagBox{-webkit-box-sizing:border-box;height:100%;width:100%}.ieContentFix{display:none;font-size:200px;height:100%;overflow:hidden;width:100%}.fbPhotosPhotoTagboxBase .innerTagBox{border:4px solid #fff;border-color:rgba(255, 255, 255, .8)}*/.fbPhotosPhotoTagboxBase .tag{bottom:0;left:50%;position:absolute}.fbPhotosPhotoTagboxBase .tagPointer{left:-50%;position:relative}.fbPhotosPhotoTagboxBase .tagArrow{left:50%;margin-left:-10px;position:absolute;top:-10px}.fbPhotosPhotoTagboxBase .tagName{background:#fff;color:#404040;cursor:default;font-weight:normal;padding:2px 6px 3px;top:3px;white-space:nowrap}.fancybox-inner:hover .fbPhotosPhotoTagboxes{opacity:1;z-index:9998;}.fbPhotosPhotoTagboxes .tagBox .tag{top:85%;z-index:9999}.fbPhotosPhotoTagboxes .tag, .fbPhotosPhotoTagboxes .innerTagBox, .fbPhotosPhotoTagboxes .borderTagBox{visibility:hidden}.tagBox:hover .tag/*, .tagBox:hover .innerTagBox*/{opacity:1;/*-webkit-transition:opacity .2s linear;*/visibility:visible}</style>';
    tHTML=tHTML+'<header id="hd"><div class="logo" id="logo"><div class="wrapper"><h1><a id="aName" href='+c.aLink+'>'+c.aName+'</a> '+((c.aAuth)?'- '+c.aAuth:"")+' <button onClick="cleanup()">ReStyle</button></h1><h1>Press Ctrl+S (with Complete option) to save all photos. [Photos are located in _files folder]</h1></div></div></header>';
    tHTML=tHTML+'<center id="aTime">'+c.aTime+'</center><br><center id="aDes">'+c.aDes+'</center><br><div id="output" class="cName"></div><div class="wrapper"><div id="bd"><div id="container" class="masonry">';
    tHTML=tHTML+b.join("")+'</div></div></div><script src="'+location.protocol+'//dl.dropbox.com/u/4013937/jquery.min.js"></script></body></html>';
    if(g.newWin){
      var w = window.open("data:text/html;charset=utf-8," + encodeURIComponent(tHTML),"_blank"); w.focus();
    }else{
      try{document.write(tHTML); document.close();}catch(e){
      alert('Cannot write content, open in new window instead.');
      var w = window.open("data:text/html;charset=utf-8," + encodeURIComponent(tHTML),"_blank"); w.focus();
    }}
    break;
    }
};