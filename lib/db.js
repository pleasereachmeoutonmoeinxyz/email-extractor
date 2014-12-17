var sqlite3 =   require('sqlite3').verbose(),
    fs      =   require('fs'),db;
    
var Deferred    =   require('simply-deferred').Deferred;

module.exports  =   function(sqliteFile,schemaFile){
    sqliteFile = __dirname + '/' + sqliteFile;
    schemaFile = __dirname + '/' + schemaFile;
    (function(){
        db      =   new sqlite3.Database(sqliteFile);
        try{
            data    =   (fs.readFileSync(schemaFile)).toString('utf-8');        
            db.serialize(function(){
                db.run(data);
            });
        } catch(err){
            console.log(err);
        }            
        function cleanup(){
            db.close();
        }
        process.on('exit', cleanup);
        process.on('SIGINT', cleanup);
        process.on('uncaughtException', cleanup);            
    })();
    return {
        addUrl:function(url){
            var stmt = db.prepare("INSERT INTO Urls(url) VALUES (?)");
            stmt.run(url);
            stmt.finalize();
        },
        isItExists:function(url){
            var dfr = new Deferred();
            db.get("SELECT count(url) as count FROM Urls WHERE url=?",url,function(err,data){
                if (err || data === undefined || data.count === undefined){
                    dfr.reject();
                }
                dfr.resolve(data['count']);
            });            
            return dfr;
        },
        makeDBEmpty:function(time){
            var time = time || (new Date());
            time.setDate(time.getDate() - 1);
            db.run("DELETE FROM `Urls` WHERE DATETIME(time) <= '" + time.toISOString() + "'");
        }
    };
}