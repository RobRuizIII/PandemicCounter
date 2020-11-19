from bs4 import BeautifulSoup
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options


# Create class that will allow for all scraping that will be done by app.py

class CountryStats(object):

    def __init__(self,source,country=None,tag_data=None,tag_key=None,keywords=None,worldometer=False):

        '''
        source is the url which will be scraped
        country is the country that will be scraped (None if worldometer = True)
        tag_data is the tag in which the text being scraped for will be found
        tag_key is the tag that allows for finding tag_data in a faster manner
        keywords is a list of keywords for each website that represent Total Infected, Total Recovered, and Total Dead
        worldometer is True if scraping from worldometer.com and doen't require any positional arguments besides source and worldometer=True --> Otherwise False
        self.driver is the webdriver used for obtaining page_source (selenium)
        '''


        # Establishing chrome webdriver options

        window_size = "1920,1080"
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--window-size=%s" % window_size)


        self.source = source
        self.keywords = keywords
        self.worldometer = worldometer
        self.country = country
        self.tag_key = tag_key
        self.tag_data = tag_data
        self.driver = webdriver.Chrome(ChromeDriverManager().install(), chrome_options=chrome_options)



    def get_doc(self):

        '''
        driver gets the source (selenium)
        create soup with beautiful soup
        '''

        self.driver.get(self.source)
        self.soup = BeautifulSoup(self.driver.page_source, 'lxml')



    def parse_info(self):

        country_dict = {}

        if self.worldometer:

            # Scrape worldometer html using beautiful soup, obtain stats required, and fill country_dict

            all_rows = self.soup.find_all("tr")

            for row in all_rows:

                stats_dict = {}
                row = list(filter(lambda a: a != '\n',row.contents))


                if row[1].text == 'World' or row[1].text == 'Asia' or row[1].text == 'Europe' or row[1].text == 'North America' or row[1].text == 'Country,Other' or '\n' in row[1].text:
                    continue
                
                try:
                    repeat_val = country_dict[row[1].text]
                    continue
                except:
                    pass
                
                stats_dict['Cases'] = row[2].text
                stats_dict['Deaths'] = row[4].text
                stats_dict['Recovered'] = row[6].text

                if row[1].text == 'USA':
                    try:
                        repeat_val = country_dict['United States']
                        continue
                    except:
                        pass
                    country_dict['United States'] = stats_dict
                elif row[1].text == 'UK':
                    try:
                        repeat_val = country_dict['United Kingdom']
                        continue
                    except:
                        pass
                    country_dict['United Kingdom'] = stats_dict
                elif row[1].text == 'Iran':
                    try:
                        repeat_val = country_dict['Iran, Islamic Republic of']
                        continue
                    except:
                        pass
                    country_dict['Iran, Islamic Republic of'] = stats_dict
                elif row[1].text == 'Russia':
                    try:
                        repeat_val = country_dict['Russian Federation']
                        continue
                    except:
                        pass
                    country_dict['Russian Federation'] = stats_dict
                elif row[1].text == 'S. Korea':
                    try:
                        repeat_val = country_dict['Korea, Republic of']
                        continue
                    except:
                        pass
                    country_dict['Korea, Republic of'] = stats_dict
                elif row[1].text == 'Czechia':
                    try:
                        repeat_val = country_dict['Czech Republic']
                        continue
                    except:
                        pass
                    country_dict['Czech Republic'] = stats_dict
                elif row[1].text == 'UAE':
                    try:
                        repeat_val = country_dict['United Arab Emirates']
                        continue
                    except:
                        pass
                    country_dict['United Arab Emirates'] = stats_dict
                elif row[1].text == 'Maldova':
                    try:
                        repeat_val = country_dict['Maldova, Republic of']
                        continue
                    except:
                        pass
                    country_dict['Maldova, Republic of'] = stats_dict
                elif row[1].text == 'Bolivia':
                    try:
                        repeat_val = country_dict['Bolivia, Plurinational State of']
                        continue
                    except:
                        pass
                    country_dict['Bolivia, Plurinational State of'] = stats_dict
                elif row[1].text == 'Total:':
                    continue
                else:
                    country_dict[row[1].text] = stats_dict

            # Close driver
            self.driver.quit()

            # Return filled dictionary
            return country_dict
        
        
        stats_dict = {}
        for keyword in self.keywords:

            # Path for Germany and India websites
            # Make as general as possible to be flexible towards html changes

            key_tag = self.soup.find(self.tag_key, string=keyword)

            if key_tag == None: # Keyword is parent (tag within tag)

                key_tag = self.soup.find(lambda tag:tag.name==self.tag_key and keyword in tag.text)


                for child in key_tag.children:
                    try:
                        if child.name == self.tag_data:
                            stats_dict[keyword] = child.text
                    except:
                        pass

            elif key_tag.parent.find(self.tag_data) != None: # Siblings
                stats_dict[keyword] = key_tag.parent.find(self.tag_data).text

        if len(stats_dict) != 0:
            country_dict[self.country] = stats_dict
            self.driver.quit()
            return country_dict

        return None
        
            
            


