/**
 * Module dependencies.
 * 
 * To insert unique index on the db
 * 
 *  mycoll.ensureIndex({'username':1}, {unique : true});
 * 
 */
var mongodb =  require('mongodb');
var mongoclient = mongodb.MongoClient;
var bodyparser = require('body-parser');
//var db= require('./models/db.js');
var AES = require("crypto-js/aes");
var SHA256 = require("crypto-js/sha256");
var CryptoJS = require("crypto-js");
var Combinatorics = require('js-combinatorics');
var chalk = require('chalk');
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , redis = require('redis')
  , http = require('http')
  , bcrypt = require('bcrypt')
  , session = require('express-session')
  , PropertiesReader = require('properties-reader')
  , path = require('path')
  , helmet = require('helmet')
  , crypto = require('crypto')
  , algorithm = '' /*--removed for security reasons ---*/
  , password = '' /*--removed for security reasons ---*/;

var request = require('request');

var SALT_WORK_FACTOR = 1; /* -- changed for security Reasons ---*/
var app = express();
var property = PropertiesReader('configuration/app-prod.properties');
// all environments
app.set('port', process.env.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(helmet());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));
//app.use(cookieParser());
var session=require('express-session');

var expiryDate = new Date( Date.now() + 60 * 60 * 500 ); // 0.5 hour

app.use(
	session({	name : 'session',
				resave: true, saveUninitialized: true,
				secret:"iuy24r7866UIOUPUNQW7089jhk", /*--changed for security reasons ---*/
				keys : ['asjhnfeqwiu76493672@$589y', 'UHDNUinw89370247025265='], /*--changed for security reasons ---*/
				cookie : {
//		            domain: 'example.com',
//		            path: 'foo/bar',					
					secure: true,
			        httpOnly: true,
			        expires: expiryDate					
				}
			}
	)
);

var mongodb_url = [property.get("mongodb.config.url.read"), property.get("mongodb.config.url.write")];
var mongodb_database = property.get("mongo.config.mlab.database");
var redis_url = property.get("redis.url");
var redisClient = redis.createClient(redis_url);

redisClient.on('connect', function() {
    console.log('Connected to Redis');
});

redisClient.set("foo", "bar", redis.print);
redisClient.get("foo", function (err, reply) {
    if (err) 
    	throw err;
    console.log(reply.toString());
});	

mongoclient.connect(mongodb_url[0], function(err, db)  {
	var adminDB = db.admin();	
	if (err) {
		console.log('could not connect to db');
		throw err;
	}
	
	adminDB.serverStatus(function(err1, status){
		if (status)
			console.log('connected to admin');
	});
	
	oauthDB  = db.db(mongodb_database);

	oauthDB.collection('siteuser' , function (err, coll) {
		if (err)
		{
			console.log('user collection not found...!');
			throw(err)
		}
		else 
		{
			console.log('user collection found...');
			
			coll.find( function(err1, userCursor) 
			{				
				if (err1) 
				{					
					console.log('... either corrupt data or some error :' + err1);
					throw(err1)
				}
				else 
				{					
					userCursor.each(function(error, userObj){
							
						console.log('...checking validity of user');
						
						if (userObj){									
							oauthDB.collection('provider').find( 
								{ "username": userObj.username }, function (err, cursor){
								cursor.each(function(error, doc) {
								      //assert.equal(err, null);
									if (error)
										throw(error)
								      if (doc != null) {
								    	  routes.getServices(doc, oauthDB, function(records){
								    		  var record = {
								    				  userRec :
								    				  { user : userObj, services: records}	  
								    		  };
								    		  //console.log(".."+JSON.stringify(record)); 
								    	  	});
								    	  };
								    	 /*
								    	 var getServices = function(doc, oauthDB, callback) {
								         var i = 0;
								         var services = [];
								         doc.services.forEach(function(entry) {
								        	    oauthDB.collection(entry.namespace).
								        	    findOne({"_id": entry.oid}, function(err, doc){
								        	    	console.log(doc.name);
								        	    	services.push[doc];
								        	    });								        	    
								        	});
								         	callback(services)
								    	 }
								         //console.log('User : ' + JSON.stringify({user : userObj, services : services}));
								      	*/
								      });									
								});
						}
						else {								
							console.log('---End---');
						}
						//oauthDB.close();
					});
				}
			});
		}
	});	
});

console.log('End');

// development only

app.get('/second', routes.second);
app.get('/', routes.index);
app.get('/logout', routes.logout);
app.get('/services', routes.services);
app.get('/oauth', routes.oauth);
app.get('/client', routes.client);

app.post('/login', function(req, res){
    session = req.session;
    var query = {
			username : req.body.username
		};
    var username='', password='', hash='', bFound=false;
    
    routes.findRecord(mongoclient, mongodb_url[0], mongodb_database, redisClient, query, 'siteuser' , function (data, err) {
    	
    	var rData = JSON.parse(data);
    	if (err) {
    		console.error(err);
    		return routes.handleError(res, err, 'Error finding record...!', 404);
    	}
    	else if(data == null) {
    		routes.handleError(res, 'no record found', 'Error finding record...!', 404);
    	}
    	else {
    		username = rData.userRec.user.username;
    		hash = rData.userRec.user.password;
    		password = hash;

    		bcrypt.compare(req.body.password, hash, function(err, isMatch) {
        	        	
            if(err) {
            	console.error(err);
            	return routes.handleError(res, err, 'Error finding record...!', 571);
            }                    
            bFound = isMatch;
            console.log('do they match?', bFound);     
            
            if (bFound) {
                console.log("Authentication Sucessful");
                req.session.username = query.username;
                req.session.loggedIn = true;                
                console.log("Got User : " + req.session.username);  
                var user = {
                		user : {
                			username :req.session.username, 
                			loggedIn:req.session.loggedIn,
                			services : rData.userRec.services
                		}
                }
                res.status(200).json(user);               
            }
            else {
                console.log("Authentication Unsucessful");
                var message="Invalid email or password";
                console.log("Message :"+message);
                var user = {
                		user : {
                			username :req.session.username, 
                			loggedIn:false,
                			services : rData.userRec.services
                		}
                }
                res.status(410).json({error:message});
            }
    	});
    }  
 });
});    
app.post('/users', function(req, res) {
	session = req.session;

	var user = {
			username : req.body.username,
			password : req.body.password,
			email : req.body.email
		};
	
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) 
        	return err;

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) 
            	return err;

            user.password = hash;
        	routes.dbOperation(mongoclient, mongodb_url[1], mongodb_database, res, 'insert', 'siteuser', user, routes.handleError);	
        });               
    });		
});

app.post('/providerkey', function(req, res) {
	
	var hash = ''; /*--- Removed For Security Reasons ---*/ 
	var hashKey = ''; /*---- Removed For Security Reasons ---*/	
	var hashId = routes.encrypt(req.body.name, crypto, algorithm, password);
	
	var provider = 
		{	username : req.body.username,
			service : [ 
			 {
				name : req.body.name,
				url : req.body.url,
				redirectUri : req.body.redirectUri,
				description : req.body.description,	
				secret : hashKey,
				appId : hashId 			    	 
			  }			     
			]
		};	
	res.status(200).json(provider);
	res.end();
	//routes.dbOperation(mongoclient, res, 'insert', 'provider', provider, routes.handleError);	
});
 
app.post('/providers', function(req, res) {
	var athena_service_url = property.get("athena.oauth.register.url");
	var form =   {	
					username : req.body.username,
					appId : req.body.appId, 
			 		name : req.body.name,
			 		description : req.body.description,
			 		url : req.body.url,
			 		redirectUri : req.body.redirectUri,
			 		registrationType : 'push',
			 		secret : req.body.secret,
			 		icon : 'samples.ico',
			 		type : 'push'				
				};	
	//Call Post
	request.post({url:athena_service_url, form : form}, function optionalCallback(err, httpResponse, body) {	
		if(err) {
        	console.error(err);
        	return routes.handleError(res, err, 'Error creating provider...!', 415);
        } 
		res.status(200).json(body);
		res.end();
	});res

});



app.post('/authorize', function(req, res) {
	var athena_service_url = property.get("athena.oauth.authz.url");
	var options = {
			url: athena_service_url,
			method: 'POST',
			headers: {
				 client_id : req.body.appId,
				 client_secret : req.body.secret,
				 redirectUrl : req.body.redirectUri 
				}
			};	
	request(options, function(err, httpResponse, body) {	
		if(err) {
        	console.error(err);
        	return routes.handleError(res, err, 'Error Authorizing...!', 415);
		} 			
		var response = {
				authorize : JSON.parse(body)        		
        };
		//console.log("authorize :" + response.authorize.auth_code);
		res.status(200).json(response);
		res.end();		
	});		
});

app.post('/accesstoken', function(req, res) {
	var athena_service_url = property.get("athena.oauth.unauth.url");
	var options = {
			url: athena_service_url,
			method: 'POST',
			headers: {
				 client_id : req.body.appId,
				 client_secret : req.body.secret,
				 auth_code : req.body.auth_code 
				}
			};	
	request(options, function(err, httpResponse, body) {	
		if(err) {
        	console.error(err);
        	return routes.handleError(res, err, 'Error Verifying Unauth token...!', 415);
		} 			
		var response = {
				accessToken : JSON.parse(body)        		
        };
		//console.log("accessToken :" + response.accessToken.access_token);
		res.status(200).json(response);
		res.end();		
	});		
});

app.post('/tokenverify', function(req, res) {
	var athena_service_url = property.get("athena.oauth.verify.url");
	var options = {
		
		url: athena_service_url + '/' + req.body.access_token
	  , method: 'GET' 
		/*, 
		 headers: {
			 client_id : req.body.appId,
			 client_secret : req.body.secret,
			 access_token : req.body.access_token 
		  }
		*/
	};	
		
		request(options, function(err, httpResponse, body) {	
		
		if(err) {
        	console.error(err);
        	return routes.handleError(res, err, 'Error Verifying Access token...!', 407);
		} 			
		var response = {
				tokenverify : JSON.parse(body)        		
        };
		if (response.tokenverify.status === 'error') {
			
			response = {
					tokenverify : {
						status : response.tokenverify.status,
						msg : response.tokenverify.msg,
						code : response.tokenverify.code,
						client_redirect : ''
				}
			}
		}
		//console.log("tokenverify  starus :" + response.tokenverify.status);
		res.status(200).json(response);
		res.end();		
	});		
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
