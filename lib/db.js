var sqlite3 =   require('sqlite3').verbose(),
    fs      =   require('fs'),db;
    
var Deferred    =   require('simply-deferred').Deferred;

module.exports  =   function(sqliteFile,schemaFile){
    logger      =   require('winston');
    (function(){
        db      =   new sqlite3.Database(sqliteFile);
        try{
            data    =   (fs.readFileSync(schemaFile)).toString('utf-8');        
            db.serialize(function(){
                db.run(data);
            });
        } catch(err){

        }            
    })();
    
    return {
        addUrl:function(url){
            var stmt = db.prepare("INSERT INTO Urls VALUES (?)");
            stmt.run(url);
            stmt.finalize();
        },
        isItExists:function(url){
            var dfr = new Deferred();
            db.get("SELECT count(url) FROM Urls WHERE url=?",url,function(err,data){
                if (err){
                    dfr.reject();
                    logger.error(err);
                }
                dfr.resolve(data);
            });            
            return dfr;
        },
        makeDBEmpty:function(){
            db.run("DELETE FROM `Urls`");
        }
    };
}