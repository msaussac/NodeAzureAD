
/*
 * GET users listing.
 */

exports.index = function(req, res){
  var user = '';
  	if(req.isAuthenticated()){
  		user = req.user.email;
  	}
  	res.render('secure', {user: user, isAuthenticated: req.isAuthenticated() });
};