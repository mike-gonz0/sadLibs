const storyRequest = 'http://madlibz.herokuapp.com/api/random';
const wordRequest = 'https://wordsapiv1.p.rapidapi.com/words/';

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
    var requestUrl = storyRequest+'?minlength='+storyLength+'&maxlength='+storyLength; 
    getStory(requestUrl); // sends a request to the madLibz api to grab a random story
});

inputForm.on('click', '.random', function(event) {
    event.preventDefault();
    console.log("Random button is clicked");
    var wordPos = $(this).siblings('input').attr('placeholder'); // storing the part of speech
    var randWordRequest = wordRequest + "?random=true?partofspeech=" + wordPos; // making request call based on part of speech
    // var randWordRequest = "https://wordsapiv1.p.mashape.com/words/chair";
    console.log(randWordRequest);
    getRandWordsReq(randWordRequest); 
})

submitBtn.on('click', assembleStory);

//function that handles the madLibz api request
function getStory(requestUrl) {
    fetch(requestUrl).then(function(res) {
        return res.json();
    }).then(function(data) {
        storyData = data;
        renderInputs();
    });
}

// function that handles the WordsAPI api request
function getRandWordsReq(requestUrl) {
    console.log("getRandWordsReq called");
    fetch(requestUrl, options).then(function(response) {
        console.log(response)
        return response.json();
    }).then(function(data) {
        // console.log(data);
        // console.log(data.results);
        // console.log(data.results.data);
        // console.log(data.results.data[99]);
        console.log(data.results.data[Math.floor(Math.random() * 100)]);
    });
}

//generates inputs that the user uses to fill in the blanks
function renderInputs() {
    $('body').empty();
    var bodyEl = $('#body'); // grabs the body element
    bodyEl.append(inputForm); // appends the form element to the page
    for (var i = 0; i < storyLength; i++) { // makes an input for the number of branches 
        var row = $('<div>'); // makes a creates a new div
        var blankInp = $('<input>'); // creates a new input element
        // sets the placeholder of the input to be the needed type of the input
        blankInp.attr('placeholder', storyData.blanks[i]); 
        var randomizeBtn = $('<button>Random</button>'); // creates a new button element with the text "Random"
        // console.log(randomizeBtn);
        randomizeBtn.addClass("random");
        //appends the generated elements to the page
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
    var createDiv = $('<div>').addClass('divBox container col-6');
    $('body').append(createDiv);
    var resetBtn = $('<button>ResetBtn</button>').addClass('resetBtn btn btn-primary')

}

    // //appends the <p> element to the page
    // $('body').append(storyEl);
    var storyEl = $('<p>'); // makes a new <p> element

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
        btn.attr('data-story', savedStories[i]);
        $('#prevStories').append(btn);
    }
}
