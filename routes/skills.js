var express = require('express');
var router = express.Router();
var skills = require('../public/json/skills.json');
var sets = require('simplesets');

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

  // Make skill set for recursive call
  for ( var skill_name in skills){
    var skill = JSON.parse(JSON.stringify((skills[skill_name])));
    skill['name'] = skill_name;
    sorted_skills.push(skill);
  }

  // Sort skills by cost, increasing
  sorted_skills.sort( sort_skills );

  var purchases_set = get_set_of_available_purchases(sorted_skills, gold, user_level);

  res.send("Skills with levels: "+JSON.stringify(skills)+"<br><br>Purchases set:<br><pre>"+JSON.stringify(purchases_set.array(), null, 2)+"</pre>");
  //res.render('skills', {"skills" :  skills, 'user_level':user_level, 'gold':gold});
});

function sort_skills(a, b){
  return a.levels[a.current_level] - b.levels[b.current_level];
}

function get_set_of_available_purchases(skills_array, gold, level){

  //Empty List || Cheapest Too expensive
  if(skills_array == null || skills_array.length == 0){
    //Return empty set
    return new sets.Set();
  } 
  console.log("Level: "+level+", Gold: "+gold+", Skill: "+skills_array[0].name+":"+skills_array[0].current_level);
  if( cost_this_level(skills_array[0],level) > gold ){
    //Return empty set
    return new sets.Set();
  }

  var result_set;

  // Add this 

  var skills_minus_current = clone(skills_array);
  skills_minus_current.shift();
  

  //Not Used 
  //call subs, full money, Add to set
  result_set = get_set_of_available_purchases(skills_minus_current, gold, level);

  //Used no upgrades
  //call subs, money - skill cost - 10, level + 1
  var upgrade_set;
  upgrade_set = get_set_of_available_purchases(skills_minus_current, gold - 10 - cost_this_level(skills_array[0], level), level + 1);

  //Used with upgrades
  //Check if upgrade is available, and if it is affordable
  if( skills_array[0].current_level < skills_array[0].levels.length - 1 
      && cost_this_level({"levels":skills_array[0].levels,"current_level":skills_array[0].current_level + 1}) < gold - cost_this_level(skills_array[0], level)){
    var skills_with_upgrade = clone(skills_array);
    //Create upgraded skill
    var upgraded_skill = clone(skills_with_upgrade.shift());
    upgraded_skill.current_level += 1;

    skills_with_upgrade.unshift(upgraded_skill);

    // Must sort list so cheapest is element 0
    skills_with_upgrade.sort( sort_skills );
    upgrade_set = upgrade_set.union(get_set_of_available_purchases(skills_with_upgrade, gold - 10 - cost_this_level(skills_array[0], level), level + 1));  
  }
  
  //Add current skill to each result set.
  var upgrade_set_array;
  upgrade_set_array = upgrade_set.array();
  if(upgrade_set_array.length == 0){
    upgrade_set_array.push(JSON.stringify([truncate_skill(skills_array[0])]));
  } else {
    for( var i in upgrade_set_array ){
      upgrade_set_array[i] = JSON.stringify((new sets.Set(JSON.parse(upgrade_set_array[i])).add(truncate_skill(skills_array[0]))).array());
    }
  }

  // return result set

//  console.log("Level: "+level+", Gold: "+gold+", Skill: "+skills_array[0].name+":"+skills_array[0].current_level+" || Returning: "+JSON.stringify(result_set.union(new sets.Set(upgrade_set_array)).array(), null, 2));
  return result_set.union(new sets.Set(upgrade_set_array));
}

function truncate_skill(skill){
  return {"name":skill.name,"current_level":skill.current_level};
}
function add_level(skill){
  //todo  
}

function cost_this_level(skill, level){
  return skill.levels[skill.current_level] + level * 10;
}

function clone(obj){
  return JSON.parse(JSON.stringify(obj));
}

router.get("/", function(req, res) {
  res.redirect('/skills/0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100');
});

module.exports = router;
