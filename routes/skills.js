var express = require('express');
var router = express.Router();
var skills = require('../public/json/skills.json');

/* GET home page. */

router.get(/^\/(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d)+,(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)$/, function(req, res) {
  var param_array = [];
  for(var i = 0; i < 32; i++){
    param_array[i] = req.params[i];
  }
  var gold = req.params[32];
  var i = 0;
  console.log(req.route);
  user_level = 0;
  for ( var skill_name in skills ){
    var url = param_array.slice(0);
    var current_level = parseInt(req.params[i]);
    user_level += current_level;

    skills[skill_name]['current_level'] = current_level;
    

    url[i] = Math.min(parseInt(current_level)+1,skills[skill_name]['levels'].length);
    skills[skill_name]['plus_url']  = "/skills/"+url.join(',');
    url[i] = Math.max(parseInt(current_level)-1,0);
    skills[skill_name]['minus_url'] = "/skills/"+url.join(',');
    i++;
  }

  var sorted_skills = [];

  for ( var skill_name in skills){
    if(skills[skill_name]['levels'].length != skills[skill_name]['current_level']){
      skills[skill_name]['cost_this_level'] = parseInt(skills[skill_name]['levels'][skills[skill_name]['current_level']]) + user_level*10;
    } else {
      skills[skill_name]['cost_this_level'] = "MAX";
    }

    sorted_skills.push(skills[skill_name]);
    console.log(JSON.stringify(skills[skill_name]));
  }

  sorted_skills.sort( function(a, b){
    return a['cost_this_level'] - b['cost_this_level'];
  });

  //res.send("Skills with levels: "+JSON.stringify(skills));
  res.render('skills', {"skills" :  skills, 'user_level':user_level, 'gold':gold});
});

router.get("/", function(req, res) {
  res.redirect('/skills/0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100');
});

module.exports = router;
