const storyRequest = 'https://madlibz.herokuapp.com/api/random';
const wordRequest = 'https://wordsapiv1.p.rapidapi.com/words/';

var bodyParts = ["head", "arm", "leg", "torso", "fingers", "index finger", "middle finger", "ring finger", "pinky", "big toe", "toes", "elbow", "eyes"]; // length 12
var liquids = ["water", "milk", "wine", "blood", "apple juice", "orange juice", "juice" ];
var places = ["USA", "Japan", "Canada", "South Korea", "Italy", "France", "Norway", "Mexico", "Brazil", "Australia", "Germany", "Cambodia", "China"];
var clothing = ['shirt', 'skirt', 'pants', 'shorts', 'suit', 'high heels', 'jacket', 'hoodie', 'scarf', 'swimsuit', 'polo shirt', 'dress', 'sweater', 'socks', 'gloves', 'boots'];
var names = ['Benton', 'Charles', 'Christy', 'Michael'];
var animals = ['bear', 'red panda', 'wolf', 'cat', 'pitbull', 'monkey', 'rat', 'tiger', 'penguin', 'donkey', 'lion', 'shiba inu', 'corgi', 'giraffe'];

// API Key of WordAPI
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '6305df614bmsh1e297ce718d1c45p1b597djsnf7ec4eaf952e',
		'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
	}
};

var submitBtn = $('<button>Make Me a Story!</button>');
var inputForm = $('<form>'); // makes a new form element


var startBtn = $('#start');

var storyLength;
var storyData;
//gets the list of saved stories from localStorage
var savedStories = JSON.parse(localStorage.getItem('stories')) || [];

init();

startBtn.on('click', function() { //start button event listener
    //gives the variable the value inputted into the modal 
    storyLength = $('#lengthInput').val();
    if (storyLength < 10) storyLength = 10;
    //fills in required content for requestUrl
    var requestUrl = storyRequest+'?minlength=10&maxlength='+storyLength; 
    getStory(requestUrl); // sends a request to the madLibz api to grab a random story
});

// When random button is clicked, 
inputForm.on('click', '.random', function(event) {
    event.preventDefault(); // Stops page from refreshing
    var input =  $(this).siblings('input'); // Grabs the input associated with this button
    var wordType = input.attr('placeholder'); // storing the part of speech
    
    // if word type is not a part of speech, consider if conditions
    if (wordType == 'body part' || wordType == 'another body part' || wordType == 'part of body') {
        input.val(Math.floor(Math.random() * (bodyParts.length-1)));
    } else if (wordType == 'type of liquid') {
        input.val(Math.floor(Math.random() * (liquids.length-1)));
    } else if (wordType == 'article of clothing') {
        input.val(Math.floor(Math.random() * (clothing.length-1)));
    } else if (wordType == 'named') {
        input.val(Math.floor(Math.random() * (names.length-1)));
    } else if (wordType == 'animals' || wordType == 'animal') {
        input.val(Math.floor(Math.random() * (animals.length-1)));
    } else if (wordType == 'place' || wordType == 'foreign country' || wordType == 'noun; place') {
        input.val(Math.floor(Math.random() * (places.length-1)));
    } else if (wordType == 'number') {
        input.val(Math.floor(Math.random() * 100));
    } else {
        if (wordType == 'plural noun' || wordType == 'nouns' || wordType == 'plural noun; type of job') {
            wordType = 'noun';
        }
        if (wordType == 'verb ending in -ing' || wordType == 'verb ending in ing' || wordType == 'verb ending \'ing\'' || wordType == 'past tense verb') {
            wordType = 'verb';
        }
        if (wordType == 'adjective ending in -est') {
            wordType = 'adjective';
        }
        var randWordRequest = wordRequest + "?random=true&partOfSpeech=" + wordType; // making request call based on part of speech
        getRandomWord(randWordRequest, input);
    }
})

submitBtn.on('click', assembleStory);

//function that handles the madLibz api request
function getStory(requestUrl) {
    fetch(requestUrl).then(function(res) {
        return res.json();
    }).then(function(data) {
        storyData = data;
        console.log(data);
        renderInputs();
    });
}

// function that handles the WordsAPI api request and setting the input's value
function getRandomWord(requestUrl, input) {
    fetch(requestUrl, options).then(function(response) {
        return response.json();
    }).then(function(data) {
        input.val(data.word); // sets the input's value
    });
}

//generates inputs that the user uses to fill in the blanks
function renderInputs() {
    $('body').empty();
    var bodyEl = $('#body'); // grabs the body element
    bodyEl.append(inputForm); // appends the form element to the page
    for (var i = 0; i < storyData.blanks.length; i++) { // makes an input for the number of branches 
        var row = $('<div>'); // makes a creates a new div
        var blankInp = $('<input>'); // creates a new input element
        // sets the placeholder of the input to be the needed type of the input
        blankInp.attr('placeholder', storyData.blanks[i]); 
        var randomizeBtn = $('<button>Random</button>'); // creates a new button element with the text "Random"
        // console.log(randomizeBtn);
        randomizeBtn.addClass("random");
        //appends the generated elements to the page
        randomizeBtn.addClass('random');
        inputForm.append(row);
        row.append(blankInp);
        row.append(randomizeBtn);
    }

    //appends a submit button to the buttom of the form
    inputForm.append(submitBtn);
}

//concatenates the story and the user input
function assembleStory(event) {
    event.preventDefault(); //stops the form from resetting
    $('body').empty(); // clears the page
    var createDiv = $('<form>').addClass('divBox container col-6');
    $('body').append(createDiv);
    var resetBtn = $('<button>ResetBtn</button>').addClass('resetBtn btn btn-primary')

    // //appends the <p> element to the page
    var storyEl = $('<p id="storyGen">'); // makes a new <p> element

    //loops through the data object's arrays to concatenate the story
    //into a single paragraph and assigns that to the <p> element
    storyEl.text(storyData.value[0]);
    for (var i = 1; i < storyData.value.length-1; i++) {
        var input = inputForm.children().eq(i-1).children('input').val();
        var nextLine = storyData.value[i];
        storyEl.text(storyEl.text()+input+nextLine);
    }
    //appends the <p> element to the page
    $('.container').append(storyEl);
    $('.divBox').append(resetBtn);

    //calls a function to save the completed story into localStorage
    saveStory(storyEl.text());
}
//saves the story to localStorage
function saveStory(content) {
    var currTime = moment().format('M/D/YY'); //gets the current time
    var currentStory = { // object that holds the current story
        title: storyData.title,
        content: content,
        date: currTime
    }
    // adds the current story to the list of saved stories
    savedStories.push(currentStory); 
    //saves the list of stories to LocalStorage
    localStorage.setItem('stories',JSON.stringify(savedStories));
}

//initializes the function by displaying the buttons that contain previous stories
function init() {
    // creates the label for saved stories if there is a button generated
    if (savedStories.length > 0) {
        var label = $('<h3>');
        label.text("Previous Stories");
        $('#prevStories').append(label);
    }

    //loops through the list of saved stories and makes a button for each one
    for (var i = 0; i < savedStories.length; i++) {
        var btn = $('<button>');
        btn.text(savedStories[i].title+": "+savedStories[i].date);
        btn.attr('data-story', savedStories[i].content);
        $('#prevStories').append(btn);
    }
}

// initializes a screen displaying the prevstory
$('#prevStories').on('click', 'button', function(event){
    $('body').empty();
    var createDiv = $('<form>').addClass(' divBox container col-6');
    $('body').append(createDiv);
    var resetBtn = $('<button>ResetBtn</button>').addClass('resetBtn btn btn-primary');1

    var prevEl = $('<p id="prevStory">').addClass('rule1');
    $('.container').append(prevEl);
    $('.divBox').append(resetBtn);
    $('#prevStory').text($(event.target).attr('data-story'));

})
