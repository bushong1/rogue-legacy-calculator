var express = require('express');
var router = express.Router();
var skills = require('../public/json/skills.json');
var sets = require('simplesets');

/* GET home page. */

var timeoutTime;
router.get(/^\/(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d)+,(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(\w\w\w\w\w\w\w\w),(\d+)$/, function(req, res) {
  timeoutTime = new Date();
  timeoutTime = timeoutTime.setSeconds(timeoutTime.getSeconds() + 10);
  var param_array = [];
  var user_level = 0;
  for(var i = 0; i < 32; i++){
    param_array[i] = req.params[i];
    user_level += parseInt(req.params[i]);
  }
  var gold = req.params[33];
  var enabled_list = hexStringToBinaryString(req.params[32]);
  var i = 0;
  var base_url = "/skills/"+param_array.slice(0).join(',')+","+req.params[32]+",";
  var current_url = current_url+gold;

  for ( var skill_name in skills ){
    var url = clone(param_array);
    var current_level = parseInt(req.params[i]);

    skills[skill_name]['current_level'] = current_level;
    skills[skill_name]['enabled'] = parseInt(enabled_list[i]) == 1;
    skills[skill_name]['disable_url'] = "/skills/"+url.join(',')+","+toggleDisableHexAtIndex(req.params[32],i)+",0";

    // Set the url's for plus and minus links
    var plus_url, minus_url;
    var ctl = cost_this_level(skills[skill_name], user_level);
    url[i] = Math.min(parseInt(current_level)+1,skills[skill_name]['levels'].length);
    plus_url  = "/skills/"+url.join(',')+","+req.params[32]+",";
    if(ctl < gold)
      plus_url += gold - ctl;
    else
      plus_url += "0";
    url[i] = Math.max(parseInt(current_level)-1,0);
    minus_url = "/skills/"+url.join(',')+","+req.params[32]+",0";

    if(plus_url === current_url)
      skills[skill_name]['plus_url'] = "#";
    else
      skills[skill_name]['plus_url']  = plus_url;

    if(minus_url === current_url)
      skills[skill_name]['minus_url'] = "#";
    else
      skills[skill_name]['minus_url'] = minus_url;
    i++;
  }

  var sorted_skills = [];

  var outputString = "";
  if( gold >= 50 ){
    // Make skill set for recursive call
    for ( var skill_name in skills){
      // Check for: skill enabled, costs less than total gold
      if(skills[skill_name].enabled && cost_this_level(skills[skill_name],user_level) <= gold){
        var skill = JSON.parse(JSON.stringify((skills[skill_name])));
        skill['name'] = skill_name;
        sorted_skills.push(skill);
      }
    }

    // Sort skills by cost, increasing
    sorted_skills.sort( sort_skills );

    var purchases_set = get_set_of_available_purchases(sorted_skills, gold, user_level);
    // Remove duplicates
    purchases_set = remove_subset_purchases(purchases_set);

    for( var i in purchases_set ){
      purchases_set[i] = {"cost":cost_of_set(purchases_set[i].array(),user_level,skills), "upgrades":purchases_set[i].array()};
    }

    purchases_set.sort(function(a, b){
      return b.cost - a.cost;
    });

    if( new Date() > timeoutTime ){
      outputString += "Woah there, Killer. That request took a long time. Result set incomplete.\nBuy a few things, disable some skills, get less money, and try again.\n";
    }

    for( var i in purchases_set ){
      var change = gold - purchases_set[i].cost;
      outputString+= "Option "+i+":  Total Cost: "+purchases_set[i].cost+", Change: "+change+"\n";
      outputString+= "  Skills:";
      for( var j in purchases_set[i].upgrades )
        outputString += purchases_set[i].upgrades[j].name + "("+purchases_set[i].upgrades[j].current_level+"), ";
      outputString += "\n";
    }
  }

  res.render('skills', {"skills" :  skills, 'user_level':user_level, 'gold':gold, 'upgrades':outputString, 'base_url':base_url});
});

function cost_of_set(purchases_array, start_level,skills){
  var total_cost = 0;
  var p_level = start_level;
  for(var i in purchases_array){
    total_cost += cost_this_level({"levels":skills[purchases_array[i].name].levels,"current_level":purchases_array[i].current_level}, p_level++);
  }
  return total_cost;
}


function get_set_of_available_purchases(skills_array, gold, level){

  //Past timeout || Empty List || Cheapest Too expensive
  if(skills_array == null || skills_array.length == 0 || new Date() > timeoutTime){
    //Return empty set
    return new sets.Set();
  } 
  //Check if this skill has no remaining upgrades
  if(skills_array[0].current_level >= skills_array[0].levels.length){
    //Call only subs without current skill
    var skills_minus_current = clone(skills_array);
    skills_minus_current.shift();
    return get_set_of_available_purchases(skills_minus_current, gold, level);
  } else {
    if( cost_this_level(skills_array[0],level) > gold ){
      //Return empty set
      return new sets.Set();
    }

    var result_set;

    // Add this 

    var skills_minus_current = clone(skills_array);
    skills_minus_current.shift();
    
    //Case: This skill not used 
    //call child without this skill, current gold, current level
    result_set = get_set_of_available_purchases(skills_minus_current, gold, level);

    //Case: This skill used, but no upgrades
    //call child without this skill but add it to each result, money - skill cost - 10, level + 1
    var upgrade_set;
    upgrade_set = get_set_of_available_purchases(skills_minus_current, gold - cost_this_level(skills_array[0], level), level + 1);

    //Case: This skill used, adding upgrade back in
    //Check if upgrade is available, and if it is affordable
  /*  if( skills_array[0].current_level < skills_array[0].levels.length - 1 
        && cost_this_level({"levels":skills_array[0].levels,"current_level":skills_array[0].current_level + 1}) < gold - cost_this_level(skills_array[0], level)){
      var skills_with_upgrade = clone(skills_array);
      //Create upgraded skill
      var upgraded_skill = clone(skills_with_upgrade.shift());
      upgraded_skill.current_level += 1;

      skills_with_upgrade.unshift(upgraded_skill);

      // Must sort list so cheapest is element 0
      skills_with_upgrade.sort( sort_skills );
      upgrade_set = upgrade_set.union(get_set_of_available_purchases(skills_with_upgrade, gold - cost_this_level(skills_array[0], level), level + 1));  
    }
  */
    
    //Add current skill to each result from child set.
    var upgrade_set_array;
    upgrade_set_array = upgrade_set.array();
    if(upgrade_set_array.length == 0){
      upgrade_set_array.push(JSON.stringify([truncate_skill(skills_array[0])]));
    } else {
      var allEmptySets = true;
      for( var i in upgrade_set_array ){
        // Don't add this skill to empty sets
        var skill_array = JSON.parse(upgrade_set_array[i]);
        if(skill_array.length > 0 ){
          allEmptySets = false;
          skill_array.unshift(truncate_skill(skills_array[0]));
          upgrade_set_array[i] = JSON.stringify(skill_array);
        } 
      }
      //If the child set was only empty sets, need to add just this skill to result set
      if(allEmptySets)
        upgrade_set_array.push(JSON.stringify([truncate_skill(skills_array[0])]));
    }

    // return result set
    return result_set.union(new sets.Set(upgrade_set_array));
  }
}

function sort_skills(a, b){
  return a.levels[a.current_level] - b.levels[b.current_level];
}

function truncate_skill(skill){
  return {"name":skill.name,"current_level":skill.current_level};
}

function cost_this_level(skill, level){
  var current_cost = parseInt(skill.levels[skill.current_level]);
  if(current_cost > 0) {
    return current_cost + parseInt(level) * 10;
  } else {
    return 99999999999999;
  }
}

function remove_subset_purchases(purchases){
  var p_array = purchases.array();
  var result_set = [];
  for(var i in p_array)
    p_array[i] = new sets.Set(JSON.parse(p_array[i]));
  for(var i in p_array){
    if(i == p_array.length - 1){
      result_set.push(p_array[i]);
    }else{
      var is_subset = false;
      for(var j = parseInt(i) + 1; j < p_array.length; j++){
        //Check size first
        if(p_array[i].array().length <= p_array[j].array().length){
          if(isSubset(p_array[i].array(),p_array[j].array())){
            is_subset = true;
            break;
          }
        }
      }
      if(!is_subset){
        result_set.push(p_array[i]);
      }
    }
  }
  return result_set;
}

function isSubset(a, b){
  for(var i in a){
    var itemSubset = false;
    for(var j in b){
      if(a[i].name === b[j].name && a[i].current_level === b[j].current_level ){
        itemSubset = true;
        break;
      }
    }
    if(!itemSubset)
      return false;
  }
  return true;
}

function clone(obj){
  return JSON.parse(JSON.stringify(obj));
}

function binaryStringToHexString(binStr){
  return parseInt(binStr, 2).toString(16).paddingLeft('00000000');
}

function hexStringToBinaryString(hexStr){
  return parseInt(hexStr, 16).toString(2).paddingLeft('00000000000000000000000000000000');
}

function toggleDisableHexAtIndex(disableHex, idx){
  var disableBin = hexStringToBinaryString(disableHex);
  disableBin = disableBin.replaceAt(idx, (1 - parseInt(disableBin[idx])).toString());
  return binaryStringToHexString(disableBin);
}

String.prototype.replaceAt=function(index, character) {
  return this.substr(0, index) + character + this.substr(index+character.length);
}

String.prototype.paddingLeft = function (paddingValue) {
  return String(paddingValue + this).slice(-paddingValue.length);
};

router.get("/", function(req, res) {
  res.redirect('/skills/0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,ffffffff,100');
});

module.exports = router;
