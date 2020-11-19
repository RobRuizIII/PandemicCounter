from flask import Flask, render_template, request, jsonify, make_response
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from scraper import CountryStats
import requests
import json
import os
import copy


app = Flask(__name__)


# Cross Checker Function and Global Variable

translation_done = [False]


# Index page where the dynamic website resides

@app.route('/')

def index():

    # Google News API Key in news_url --> taken off for security reasons
    
    news_url = 'http://newsapi.org/v2/top-headlines?' +'country=us&q=coronavirus&apiKey=yourgoogleapikey'
    return render_template("index.html", news_url = news_url)


@app.route('/countryscraper')

def scraper():

    # Creating dictionary object from local JSON file
    # Credit of JSON file goes to hjnilsson country-flags repository in github
    # Credit of png images of each flag also goes to hjnilsson country-flags repository in github


    if translation_done[0]==False:

        root_json = os.path.realpath(os.path.dirname(__file__))
        json_url = os.path.join(root_json, "static", "countries.json")
        country_json = json.load(open(json_url))

        # Creating dictionary that will aid in obtaining country-flags by abbreviation (country code)
        translation_dict = {}
        for country_code, country_name in country_json.items():
            translation_dict[country_name] = country_code


    # Create instance of CountryStats scraper Class
    # Credit of information goes to https://www.worldometers.info/coronavirus/

    world = CountryStats('https://www.worldometers.info/coronavirus/',worldometer=True)
    world.get_doc()

    # Obtain information from worldometer.info in dictionary form
    # final_dict is the dictionary that will be sent to javascript
    final_dict = copy.deepcopy(world.parse_info()) 


    # Add "the translation dictionary" (dictionary with country names and abbreviations) to the final dictionary
    if translation_done[0]==False:
        final_dict['Translation'] = translation_dict
        translation_done[0] = True
    

    # Credit of information goes to http://www.risklayer-explorer.com/event/100/detail
    # Get information for Germany and cross check with worldometer info -- keep most recent stats

    Germany = CountryStats('http://www.risklayer-explorer.com/event/100/detail',country='Germany', tag_data='td', tag_key='th',keywords=[' Cumulative Infected ',' Total Recovered',' Total Dead '])
    Germany.get_doc()
    germany_check = Germany.parse_info()


    for key, value in germany_check.items():
        for key2, value2 in value.items():
            if key2 == ' Cumulative Infected ':
                world_compare = final_dict['Germany']['Cases']
                world_compare = int(world_compare.replace(',',''))
                if int(value2.replace(',',''))>world_compare:
                    final_dict['Germany']['Cases'] = format(int(value2),',')
            elif key2 == ' Total Recovered':
                world_compare = final_dict['Germany']['Recovered']
                world_compare = int(world_compare.replace(',',''))
                if int(value2.replace(',',''))>world_compare:
                    final_dict['Germany']['Recovered'] = format(int(value2),',')
            elif key2 == ' Total Dead ':
                world_compare = final_dict['Germany']['Deaths']
                world_compare = int(world_compare.replace(',',''))
                if int(value2.replace(',',''))>world_compare:
                    final_dict['Germany']['Deaths'] = format(int(value2),',')



    # Credit of information goes to https://www.covid19india.org/
    # Get information for India and cross check with worldometer info -- keep most recent stats

    India = CountryStats('https://www.covid19india.org/',country='India', tag_data='h1', tag_key='h5',keywords=['Confirmed','Recovered','Deceased'])
    India.get_doc()

    try:
        india_check = India.parse_info()
        for key, value in india_check.items():
            for key2, value2 in value.items():
                if key2 == 'Confirmed':
                    world_compare = final_dict['India']['Cases']
                    world_compare = int(world_compare.replace(',',''))
                    if int(value2.replace(',',''))>world_compare:
                        final_dict['India']['Cases'] = value2
                elif key2 == 'Recovered':
                    world_compare = final_dict['India']['Recovered']
                    world_compare = int(world_compare.replace(',',''))
                    if int(value2.replace(',',''))>world_compare:
                        final_dict['India']['Recovered'] = value2
                elif key2 == 'Deceased':
                    world_compare = final_dict['India']['Deaths']
                    world_compare = int(world_compare.replace(',',''))
                    if int(value2.replace(',',''))>world_compare:
                        final_dict['India']['Deaths'] = value2
    except:
        pass
                    

    # Send final_dict as JSON to Javascript

    return json.dumps(final_dict)



if __name__ == "__main__":
    app.run(debug=True)