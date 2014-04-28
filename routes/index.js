
/*
 * GET home page.
 */

exports.index = function(req, res){
	var user = '';
  	if(req.isAuthenticated()){
  		user = req.user.email;
  	}
  	res.render('index', { title: 'Express', user: user, isAuthenticated: req.isAuthenticated() });
};