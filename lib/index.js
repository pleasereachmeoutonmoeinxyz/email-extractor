"use strict";
var Crawler     =   require('crawler').Crawler,
    url         =   require('url'),    
    db          =   require('./db')('../files/schema.sql','../files/db.sqlite');
    urls        =   [];
exports.VERSION = "0.1.1";

exports.Extractor   =   function(startUrl,callback,maxConnections){
    var host    =   url.parse(startUrl).hostname;
    db.makeDBEmpty();
    var crawler = new Crawler({
                    "maxConnections":   maxConnections  ||  10,
                    "callback"      :   function(err,result,$){
                        if (!err && result && result.headers && result.headers['content-type'].toLowerCase().indexOf("text/html") >= 0){
                            $("a").each(function(index,a){
                                if (url.parse(a.href).hostname === host){
                                    db.isItExists(a.href).done(function(data){
                                        if (data === 0){
                                            db.addUrl(a.href);
                                            crawler.queue(a.href);        
                                        }
                                    });                       
                                }   
                            });
                            
                            ($("body").html().match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || []).forEach(function(email){
                                if (callback)   callback(result.options.uri,email);
                            });   
                        }
                    }
                });
    crawler.queue(startUrl);
    return crawler;
}