
/*
 * GET home page.
 */

exports.index = function(req, res){
	console.log(req.isAuthenticated());
	var user = '';
  	if(req.isAuthenticated()){
  		console.log(req);
  		user = req.user.email;
  	}
  	res.render('index', { title: 'Express', user: user, isAuthenticated: req.isAuthenticated() });
};