
var Request =  require ( "request" );

Request.get( "https://api.umd.io/v0/courses/list" , (error, response, body) => {
     if (error) {
         return   console .dir(error);
    }

    var courses = []
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
			Request.get(url, (error,response,body) => {
				if (error) {
					return console.dir(error);
				}
				 var specific_course = JSON.parse(body)
					if (specific_course != undefined) {
						var id = specific_course.course_id
						if (specific_course.relationships != undefined && specific_course.relationships.prereqs != undefined) {
							var pre_req = specific_course.relationships.prereqs
							var all_words = pre_req.split(" ");
							var pre_courses = []
							for (var i = 0; i < all_words.length; i++) {
								var word = all_words[i]
								if (word.startsWith("CMSC")) {
									pre_courses.push(word);
								}

							}
							console.log(id + " Prereq Courses: " + pre_courses)
						} else {
							console.log(id + " has no prereqs")
						}
					}
				});
			}
		}
	});