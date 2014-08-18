"use strict";
var Crawler     =   require('crawler').Crawler,
    url         =   require('url'),
    regex       =   "/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi",    
    crawled     =   [],
    emails      =   [];

exports.VERSION = "0.0.5";

exports.Extractor   =   function(startUrl,callback,maxConnections){
    var host    = url.parse(startUrl).host;
    var crawler = new Crawler({
                "maxConnections":maxConnections || 10,
                "callback":function(error,result,$) {
                    if (!error){
                        // extract emails and execute callback
                        ($("body").html().match(regex) || []).forEach(function(email){
                            if (emails.indexOf(email) === -1){
                                emails.push(email);
                                if (callback) callback(email);
                            }
                        });
                        // get new urls to crawle
                        $("a").each(function(index,a) {
                            if (url.parse(a.href).hostname === host && crawled.indexOf(a.href) === -1){
                                crawler.queue(a.href);
                                crawled.push(a.href);
                            }   
                        });                        
                    }
                }
            });
    crawler.queue(startUrl);
}