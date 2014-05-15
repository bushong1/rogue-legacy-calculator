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

  // Calculate present cost for each skill
  for ( var skill_name in skills){
/*  if(skills[skill_name]['levels'].length != skills[skill_name]['current_level']){
      skills[skill_name]['cost_this_level'] = parseInt(skills[skill_name]['levels'][skills[skill_name]['current_level']]) + user_level*10;
    } else {
      skills[skill_name]['cost_this_level'] = "MAX";
    }
*/
    var skill = JSON.parse(JSON.stringify((skills[skill_name])));
    skill['name'] = skill_name;
    sorted_skills.push(skill);
    console.log(JSON.stringify(skill));
  }

  // Sort skills by cost, increasing
  sorted_skills.sort( sort_skills );

  res.send("Skills with levels: "+JSON.stringify(skills));
  //res.render('skills', {"skills" :  skills, 'user_level':user_level, 'gold':gold});
});

function sort_skills(a, b){
  return a.levels[a.current_level] - b.levels[b.current_level];
}

function get_set_of_available_purchases(skills_array, gold){

  // Return if skills_array is empty  
  if(skills_array == null || skills_array.length == 0){
    return [];
  }

  // Return nothing when the cheapest skill in the array is too expensive
  if(skills_array[0].cost_this_level > gold){
    return [];
  }
//Algorithm
//States:
//Empty List || Cheapest Too expensive
  //Return empty set
//Skill->
  //Not Used 
    //call subs, full money
      //Add to set
  //Used no upgrades
    //call subs, money - skill cost - 10
    //Push skill to all
      //Add to set
  //Used add upgrades
    //Check if upgrade needed
    //call subs + upgrade, money - skill cost - 10
      //Push skill to all
      //Add to set + Skill
  //Return set
  var skills = skills_array.slice(0);

  current_skill = skills.shift();
  get_set_of_available_purchases(sub_set, gold - parseInt(current_skill.cost_this_level) - 10);
}

function add_level(skill){
  //todo  
}

function cost_this_level(skill, level){
  return skill.levels[skill.current_level] + level * 10;
}

router.get("/", function(req, res) {
  res.redirect('/skills/0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100');
});

module.exports = router;
