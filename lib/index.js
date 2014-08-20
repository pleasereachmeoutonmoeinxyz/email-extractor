"use strict";
var Crawler     =   require('crawler').Crawler,
    url         =   require('url'),    
    urls        =   [];

exports.VERSION = "0.0.7";

exports.Extractor   =   function(startUrl,callback,maxConnections){
    var host    =   url.parse(startUrl).hostname;
    var crawler = new Crawler({
                    "maxConnections":   maxConnections  ||  10,
                    "callback"      :   function(err,result,$){
                        if (!err && result && result.headers && result.headers['content-type'].toLowerCase().indexOf("text/html") >= 0){
                            $("a").each(function(index,a){
                                if (url.parse(a.href).hostname === host && urls.indexOf(a.href) === -1){
                                    crawler.queue(a.href);
                                    urls.push(a.href);
                                }   
                            });
                            
                            ($("body").html().match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || []).forEach(function(email){
                                if (callback)   callback(result.options.uri,email);
                            });   
                        }
                    }
                });
    crawler.queue(startUrl);
}