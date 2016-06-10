/*
 * GET home page.
 */

//var sync = require('synchronize')
exports.index = function (req, res) {
	session = req.session;
	res.render('index', {username: req.session.username, loggedIn: req.session.loggedIn});
};

exports.services=function(req,res){
	session = req.session;
	res.render('siteuser', { title: 'Services', session:req.session });
}
exports.oauth=function(req,res){
	session = req.session;
	res.render('siteuser', { title: 'OAuth', session:req.session });
}
exports.client=function(req,res){
	session = req.session;
	res.render('siteuser', { title: 'OAuth', session:req.session });
}
exports.second = function(req, res){
	res.render('siteuser', { title: 'Express' });
}

exports.logout=function(req,res){
req.session.destroy(function(err) {
	session = null;
	  if(err) {
	    console.log(err);
	  } else {
	    res.redirect('/');
	  }
	});
}

exports.handleError = function (res, reason, message, code) {
  console.log( "Error Code :" + code + ", " + reason);
  res.status(code || 500).json({"error": message});
};

exports.comparePassword = function(bcrypt, candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

exports.dbOperation = function (mongoclient, mongodb_url, mongodb_database, res, operation, table, data, errorHandler) {
	
	var response = mongoclient.connect(mongodb_url, function(err, db)  
	{
		var adminDB = db.admin();
		
		if (err) {
			adminDB.close();
			exports.handleError(res, err, 'Could not connect to db...!', 508);
		}
		
		adminDB.serverStatus(function(err, status){
			if (status)
				console.log('connected to admin');
		});
								
		if (operation === 'insert')  {	
			
			var oauthDB  = db.db(mongodb_database);
						
			oauthDB.collection(table , function (err, coll) 
			{				
				if (err)
				{
					oauthDB.close();
					exports.handleError(res, err, table + ' collection not found...!', 504);
				}
				else 
				{
					console.log('User collection found...');
					
					coll.insert(data, function (err, record) 
					{					
						if (err) 
						{	
							oauthDB.close();
							exports.handleError(res, err, 'Failed to create ' + table , 500);
						}
						else 
						{
							if (typeof record.ops === 'undefined')
							{
								oauthDB.close();
								exports.handleError(res, err, 'Can\'t insert duplicate ' + table + ' record', 501);					
							}
							else {
								oauthDB.close();
								console.log(table + " Record added # "+record.ops[0]._id);
								res.status(201).json(record.ops[0]);
							}
						}
					});
				}
			});			
		}
	});	 	
}

exports.encrypt = function(text, crypto, algorithm, password) {
/*
	removed for security reasons
*/	
  return crypted;
}

var Fiber = require('fibers');
exports.sleep = function(ms) {
	var fiber = Fiber.current;
	setTimeout(function() {
		fiber.run();
	}, ms);
	Fiber.yield();
}
exports.getServices = function(doc, oauthDB, callback) {
	
	Fiber(function(){
		var arr=[];
		doc.services.forEach(function(entry) {
	   	    oauthDB.collection(entry.namespace).
	   	    findOne({"_id": entry.oid}, function(err, doc){
	   	    	var serviceRec = {
	   	    		service : doc.name,
	   	    		description :doc.description,
	   	    		path : doc.path,
	   	    		uri : doc.uri
	   	    	}
	   	    	arr.push(serviceRec);
	   	    });
	   	});
		exports.sleep(100);
		oauthDB.close();
	   	callback(arr);
	}).run();
   	//console.log('User : ' + JSON.stringify({user : userObj, services : services}));
 }

exports.findRecord = function(mongoclient, mongodb_url, mongodb_database, redis, query, table, callback) {
	redis.get(query.username, function (err, reply) {
		if (err)
			callback(err);
		else if (reply) {
			mongoclient.connect(mongodb_url, function(err, db)  {
				if (err) {
					callback(reply);
					db.close();
				}
				else{
					oauthDB  = db.db(mongodb_database);
					oauthDB.collection('provider').find( 
					{ "username": query.username }, function (err, cursor){
					 cursor.count(function(error, nbDocs) 
					{
					  if (err || nbDocs==0 ) {
			    		  var record = {
			    				  userRec :
			    				  { user : JSON.parse(reply), services: []}	  
			    		  };
						  callback(JSON.stringify(record));
						  oauthDB.close();
					  }
					  else 
					  {
					  cursor.each(function(error, doc) {
					      //assert.equal(err, null);
						if (error)
							callback(error)
					      if (doc != null) {
					    	  exports.getServices(doc, oauthDB, function(records){
					    		  var record = {
					    				  userRec :
					    				  { user : JSON.parse(reply), services: records}	  
					    		  };
									callback(JSON.stringify(record));
									oauthDB.close();
					    	  });
					      }
					   });
					  }
					});
				  });
				}
			});
		}
		else {
			//console.log('Redis : no record found for :' + JSON.stringify(reply));
        	mongoclient.connect(mongodb_url, function(err, db)  {
        		if (err) {
        			callback(err);
        			db.close();
        		}
        		oauthDB  = db.db(mongodb_database);
        		
        		console.log('DB : redis could not find key ' + JSON.stringify(query.username));
        		
        		oauthDB.collection(table).findOne(query, function (err, doc) {
	                if (err || !doc) {
	                	callback(err);
	                	oauthDB.close();
	                }
	                else {
	                	//Book found in database, save to cache and return to client
	                	//console.log('DB : found record' + JSON.stringify(doc));
	                	redis.set(query.username, JSON.stringify(doc), function () {
	                		//console.log('Redis : Saving Data for' + JSON.stringify(doc));
	                        //callback(doc);

        					oauthDB.collection('provider').find( 
            				{ "username": query.username }, function (err, cursor){
        						cursor.count(function(error, nbDocs) 
								{
								  if (err || nbDocs==0) {
							    		  var record = {
						    				  userRec :
						    				  { user : doc, services: []}	  
						    		  };
									  callback(JSON.stringify(record));
									  oauthDB.close();
								  }
								  else 
								  {
	            					  cursor.each(function(error, document) {
	            					      //assert.equal(err, null);
	            						if (error)
	            							callback(doc)
	            					      if (document != null) {
	            					    	  exports.getServices(document, oauthDB, function(records){
	            					    		  //console.log(".."+JSON.stringify({ user : userObj.name , services: records})); 
	            					    		  var record = {
	            					    				  userRec :
	            					    				  { user : JSON.parse(document), services: records}	  
	            					    		  };
	            									callback(JSON.stringify(record));	
	            									oauthDB.close();
	            					    	  });
	            					      }
	            					   });
								  }});
	            				}
	            			);
	                    });
	                }
	            });
        	});
		}
    });
};

