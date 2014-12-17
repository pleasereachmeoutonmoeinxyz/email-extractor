"use strict";
var Crawler     =   require('crawler'),
    url         =   require('url'),    
    db          =   require('./db')('../files/db.sqlite','../files/schema.sql');
    
exports.VERSION = "0.2.9";

exports.Extractor   =   function(startUrl,callback,maxConnections){
    var host    =   url.parse(startUrl).hostname;
    db.makeDBEmpty();
    var crawler = new Crawler({
                    "maxConnections":   maxConnections  ||  10,
                    "callback"      :   function(err,result,$){
                        if (!err && result && result.headers && result.headers['content-type'].toLowerCase().indexOf("text/html") >= 0){
                            $("a").each(function(index,a){
                                  var toQueueUrl = $(a).attr('href');
                                  if (toQueueUrl){
                                    var parsedUrl  = url.parse(toQueueUrl);
                                    if (parsedUrl.hostname === null || parsedUrl === host){
                                        toQueueUrl = url.resolve(startUrl,toQueueUrl);
                                        db.isItExists(toQueueUrl).done(function(data){
                                            if (data === 0){
                                                db.addUrl(toQueueUrl);
                                                crawler.queue(toQueueUrl);        
                                            }
                                        });                                        
                                    } 
                                  }
                            });
                            var body  = $("body").html();
                            if (body) {
                                (body.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || []).forEach(function(email){
                                    if (callback)   callback(result.options.uri,email);
                                });   
                            }
                        }
                    }
                });
    crawler.queue(startUrl);
    return crawler;
}