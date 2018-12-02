var express = require('express');
var router = express.Router();
var app = express();
var path = require("path");
var bodyParser = require('body-parser');
var request =  require ( "request" );

var courses = []
var pres = {}
var descriptions = {}
var credits = {}

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html')

function findSuggestions(my_courses) {
    suggestions = []
    console.log("Your courses: " + my_courses);
    var my_course = my_courses[0]
    for (var key in pres) {
        console.log(key + ": " + pres[key])
        all_pres = pres[key];
        var canTake = true;
        if (all_pres.length == 0) {
            canTake = false;
        }
        for (var i = 0; i < all_pres.length; i++) {
            var individual_preq = all_pres[i]
            var fufilled = my_courses.includes(individual_preq);
            if (!fufilled) {
                canTake = false;
                break
            }
        }
        if (canTake) {
            suggestions.push(key)
        }
    }
    console.log(suggestions)
    return suggestions;
}

request.get( "https://api.umd.io/v0/courses/list" , (error, response, body) => {
     if (error) {
         return   console .dir(error);
    }
    var json = JSON.parse(body);
    for (var i = 0; i < json.length; i++) {
    	course = json[i];
    	if (course.department == "Computer Science") {
    		courses.push(course)
    	}
    }

    for (var i = 0; i < json.length; i++) {
    	var course = courses[i]
    	if (course != undefined) {
	    	var id = course.course_id
			url = "https://api.umd.io/v0/courses/" + id
			request.get(url, (error,response,body) => {
				if (error) {
					return console.dir(error);
				}
				 var specific_course = JSON.parse(body)
					if (specific_course != undefined) {
						var id = specific_course.course_id
						console.log(specific_course)
						if (specific_course.relationships != undefined && specific_course.relationships.prereqs != undefined) {
							var pre_req = specific_course.relationships.prereqs
							if (specific_course.description != null) {
							    descriptions[id] = specific_course.description
							} else {
							    descriptions[id] = "No description available"
							}
							credits[id] = specific_course.credits
							var all_words = pre_req.split(" ");
							var pre_courses = []
							for (var i = 0; i < all_words.length; i++) {
								var word = all_words[i]
								if (word.startsWith("CMSC")) {
									pre_courses.push(word.substring(0,7));
								}
							}
							pres[specific_course.course_id] = pre_courses;
							console.log(id + " Prereq Courses: " + pre_courses)
						} else {
							console.log(id + " has no prereqs")
						}
					}
				});
			}
		}
	});
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname+'/anjali/blah.html'));
})


app.post('/action_page', function(req, res){
   var my_courses = req.body.courses.split(":::").slice(0,-1)
   var suggestions = findSuggestions(my_courses);
   var all_my_course_information = []
   for (var i = 0; i < suggestions.length; i++) {
        for (var k = 0; k < courses.length; k++) {
            if (courses[k].course_id == suggestions[i]) {
                all_my_course_information.push(courses[k])
                break
            }
        }
   }
   all_my_course_information.sort()
   res.render('show_courses.ejs', {all_courses:courses, taken: my_courses, courses:all_my_course_information, my_descriptions:descriptions, my_credits:credits})
   //res.send("You have taken: Here are the courses which you fulfill the prereqs: " + suggestions.toString());
 
});

app.listen(1234, () => {
    console.log('http://localhost:1234')
})
