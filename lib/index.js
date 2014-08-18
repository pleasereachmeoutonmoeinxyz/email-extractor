"use strict";
var Crawler     =   require('crawler').Crawler,
    url         =   require('url'),
    regex       =   "/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi",    
    urls        =   [];

exports.VERSION = "0.0.6";

exports.Extractor   =   function(startUrl,callback,maxConnections){
    var host    = url.parse(startUrl).host;
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
                            
                            ($("body").html().match(regex) || []).forEach(function(email){
                                if (callback)   callback(result.options.uri,email);
                            });   
                        }
                    }
                });
    crawler.queue(startUrl);
}