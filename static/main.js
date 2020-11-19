var xmlhttp;
var currentArticles; //Latest News Articles Extracted
var newsCounter = 0; //Keeps changing the news
var previousWorldStats; //Latest Total World Statistics
var imgFinder; //JSON for country short name


//Function retrieves data from "/countryscraper" route and sends xmlhttp response
function retrieveDataFromServer(url, cfunc)
{
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=cfunc;
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}


// This function initiates the dynamic webpage by calling functions that constantly update the news,
// and reloads the stats obtained by the "/countryscraper" route

function displayUpdate(newsURL){
    currentArticles = newsUpdate(newsURL); //variable that contains api response for covid-19 news
    retrieveDataFromServer("/countryscraper",function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            countryHTML(xmlhttp.responseText); //send dictionary from "/countryscraper" to parse and creates html elments that have a coutnries stats and flag

            newsHTML(currentArticles); //send current articles of covid-19 from api and create html elements to display (news image + news article)

            setInterval(realoadStats,90000); //Constant call to /countryscraper to reload statistics every 90 seconds

            setInterval(changeArticle,45000);//Constant call to change article title and article title every 45 seconds
            
        }
    })
}



// parse json data and create image finder dictionary + country stats dictionary (all_countries)
// dynamically create elements and fill them in html

function countryHTML(jsonData){

    var allCountries = JSON.parse(jsonData); 
    imgFinder = allCountries['Translation'];
    delete allCountries['Translation'];



    previousWorldStats = totalCounter(allCountries);

    for (let[stat,num] of Object.entries(previousWorldStats)){
        if (stat == "Total Cases"){
            let caseH2 = document.createElement("div");
            caseH2.id = stat.replace(" ",'');
            caseH2.style.float = "left";
            caseH2.style.textAlign = "left";
            let statName = '<strong>'+stat+'</strong>'
            let statNumber = '<span id="TotCnum">'+num.toLocaleString()+'</span>'
            caseH2.innerHTML = statName + '<br>' + statNumber
            document.getElementById("total-stats").appendChild(caseH2)

        }else if (stat == "Total Recovered"){
            let recH2 = document.createElement("div");
            recH2.id = stat.replace(" ",'');
            recH2.style.float = "right"
            recH2.style.textAlign = "right"
            let statName = '<strong>'+stat+'</strong>'
            let statNumber = '<span id="TotRnum">'+num.toLocaleString()+'</span>'
            recH2.innerHTML = statName + '<br>' + statNumber
            document.getElementById("total-stats").appendChild(recH2)


        }else if (stat == "Total Deaths"){
            let dH2 = document.createElement("div");
            dH2.id = stat.replace(" ",'');
            dH2.style.margin = "0 auto"
            dH2.style.textAlign = "center"
            let statName = '<strong>'+stat+'</strong>'
            let statNumber = '<span id="TotDnum">'+num.toLocaleString()+'</span>'
            dH2.innerHTML = statName + '<br>' + statNumber
            document.getElementById("total-stats").appendChild(dH2)


        }
    }



    var i = 0;

    for (let [country,value] of Object.entries(allCountries)){
        i++;
        var x = document.createElement("div");
        x.className = "container content-section";
        var countryName= JSON.stringify(country);
        countryName = countryName.replace(' ', '')
        x.id = countryName;
        var countryCode = imgFinder[country]
        var flagPath = '../static/CountryFlags/'+countryCode+'.png'
        var text = '<strong>'+country+'</strong><img style="float:right;max-width: 60px; max-height: 30px; object-fit:cover;" src="'+flagPath+'")}}">';

        for (let [key, value2] of Object.entries(value)){
            let statKey = key + country.replace(" ", '')
            let statID = '<span id="' + statKey + '">'
            text += '<br />' + key + ': '+ statID + value2 + '</span>';
        }

        x.innerHTML = text

        if (i<=12){
            document.getElementById("firstcolumn").appendChild(x);
        
        } else if (i>12 && i<=24){
            document.getElementById("secondcolumn").appendChild(x);

        } else if (i>24 && i<=36){
            document.getElementById("thirdcolumn").appendChild(x);

        } else if (i>36 && i<=48){
            document.getElementById("fourthcolumn").appendChild(x);
        } else{
            break;
        }
        
    }
}



// returns latest news for coronavirus by making a google news api request

function newsUpdate(urlGoogleNews){
    $.ajax({
        url:urlGoogleNews,
        method:"GET",
        dataType:"Json",

        success: function(news){
            let latestNews = news.articles;
            currentArticles = latestNews;
        },

        error: function(){
            console.log("News Error Occured")
        }
    })
}



// creates html elements that contain the news image and news title

function newsHTML(newsArticles){
    
    let imgUrl = newsArticles[newsCounter].urlToImage;
    let articleTitle = "<b><i>"+newsArticles[newsCounter].title+"</i></b>";
    
    var currentDisplayImg = document.createElement("figure");
    currentDisplayImg.className = "img-section";
    currentDisplayImg.innerHTML = '<img id="newsimg" src="'+imgUrl+'" class="img-responsive">'

    var currentDisplayTitle = document.createElement("figcaption");
    currentDisplayTitle.className = "content-section";
    currentDisplayTitle.innerHTML = "<strong id='imgcap'>"+articleTitle+"</strong>";

    let newsDiv = document.getElementById("news-section")
    currentDisplayImg.appendChild(currentDisplayTitle)
    newsDiv.appendChild(currentDisplayImg)
    newsCounter++;


}


// changes article name + article title every time it's called
function changeArticle(){

    if(newsCounter == currentArticles.length){
        newsCounter = 0
    }

    let imgUrl = currentArticles[newsCounter].urlToImage;
    let articleTitle = "<b><i>"+currentArticles[newsCounter].title+"</i></b>";

    $("#newsimg").attr("src",imgUrl);
    $("#imgcap").html(articleTitle);

    
    newsCounter++;


}


//Call /countryscraper to get most recent statistics and update stats
function realoadStats(){
    retrieveDataFromServer("/countryscraper",function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            updateStats(xmlhttp.responseText); //Compare newest statistics to previous and update      
        }
    })

}




// Compares newest statistics scraped for each country and updates elements to newest statistics
// Creates arrows to demonstrate the addition to each stat that has been updated

function updateStats(countriestoUpdate){

    let i = 0;
    var jsonCountries = JSON.parse(countriestoUpdate)
    var newTotStats = totalCounter(jsonCountries)
    totalStatComparison(previousWorldStats,newTotStats); //calls function to compare old stats to new stats


    for (let[updateCountry, value] of Object.entries(jsonCountries)){
        i++;
        if(i>48){
            break;
        }
        for (let[key, value2] of Object.entries(value)){
            let getID = '#' + key + updateCountry.replace(" ",'');
            let standOut = '#' + updateCountry.replace(" ",'');
            if (key == 'Cases'){
                if(parseInt($(getID).text().replace(",",''))<parseInt(value2.replace(",",''))){
                    let arrowSpan = document.createElement("span")
                    arrowSpan.className = "arrow"
                    arrowSpan.innerHTML = "&#10548;"
                    arrowSpan.style.fontSize = "16px"
                    $(getID).html(value2).addClass("text-warning");
                    $(getID).append(arrowSpan);
                    $(standOut).css("border","10px solid #ffffff");
                }
            }else if (key == 'Recovered'){
                if(parseInt($(getID).text().replace(",",''))<parseInt(value2.replace(",",''))){
                    let arrowSpan = document.createElement("span")
                    arrowSpan.className = "arrow"
                    arrowSpan.innerHTML = "&#10548;"
                    arrowSpan.style.fontSize = "16px"
                    $(getID).html(value2).addClass("text-success");
                    $(getID).append(arrowSpan);
                    $(standOut).css("border","10px solid #ffffff");
                    }
            }else if (key == 'Deaths'){
                if(parseInt($(getID).text().replace(",",''))<parseInt(value2.replace(",",''))){
                    let arrowSpan = document.createElement("span")
                    arrowSpan.className = "arrow"
                    arrowSpan.innerHTML = "&#10548;"
                    arrowSpan.style.fontSize = "16px"
                    $(getID).html(value2).addClass("text-danger");
                    $(getID).append(arrowSpan);
                    $(standOut).css("border","10px solid #ffffff");
                    }
            }
            
        };
    };
    var wait = ms => new Promise((r, j)=>setTimeout(r, ms))
    var prom = wait(15000);
    prom.then(restoreNormal);
}



//removes arrows and text that are meant to show the update
function restoreNormal(){
    $('span.arrow').each(function(){
        $(this).remove();
    })
    $('span').each(function(){
        var replace = $(this).html().replace(/\+\d+/,'');
        $(this).html(replace);
        $(this).removeClass();
    })
    $('.content-section').css("border","2px solid #000744");
}


//Counts total number of cases
function totalCounter(allstatsJSON){

    var totalStats = {}
    var totCases = 0;
    var totRecovered = 0;
    var totDead = 0;

    for (let[key,values] of Object.entries(allstatsJSON)){
        for (let[stat,num] of Object.entries(values)){


            if (num==" " || num=="N/A" || num==""){
                continue
            }
            if (stat == 'Cases'){
                totCases += parseInt(num.replace(/,/g,''));
            } else if (stat == 'Recovered'){
                totRecovered += parseInt(num.replace(/,/g,''));
            }else if (stat == 'Deaths'){
                totDead += parseInt(num.replace(/,/g,''));
            }
        } 
    }

    
    totalStats['Total Cases'] = totCases;
    totalStats['Total Recovered'] = totRecovered;
    totalStats['Total Deaths'] = totDead;

    return totalStats


}



//Function that compares total old stats to total new stats

function totalStatComparison(oldJSON, newJSON){

    if(oldJSON['Total Cases']<newJSON['Total Cases']){
        let newCases = newJSON['Total Cases'] - oldJSON['Total Cases']
        let arrowSpan = document.createElement("span")
        arrowSpan.className = "arrow"
        arrowSpan.innerHTML = "&#8679;"
        $("#TotCnum").html(newJSON['Total Cases'].toLocaleString() + " +"+newCases).addClass("text-warning");
        $("#TotCnum").append(arrowSpan);
    }
    if (oldJSON['Total Recovered']<newJSON['Total Recovered']){
        let newRecovery = newJSON['Total Recovered'] - oldJSON['Total Recovered']
        let arrowSpan = document.createElement("span")
        arrowSpan.className = "arrow"
        arrowSpan.innerHTML = "&#8679;"
        $("#TotRnum").html(newJSON['Total Recovered'].toLocaleString()+ " +"+newRecovery).addClass("text-success");
        $("#TotRnum").append(arrowSpan);
    }
    if (oldJSON['Total Deaths']<newJSON['Total Deaths']){
        let newDs = newJSON['Total Deaths'] - oldJSON['Total Deaths']
        let arrowSpan = document.createElement("span")
        arrowSpan.className = "arrow"
        arrowSpan.innerHTML = "&#8679;"
        $("#TotDnum").html(newJSON['Total Deaths'].toLocaleString()+ " +"+newDs).addClass("text-danger");
        $("#TotDnum").append(arrowSpan);
    }

}
