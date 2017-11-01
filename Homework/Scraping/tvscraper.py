#!/usr/bin/env python
# Name: Mark Pijnenburg
# Student number: 11841117
'''
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
'''
import csv
from pattern.web import URL, DOM, plaintext

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tvseries"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    '''
    Extract a list of highest rated TV series from DOM (of IMDB page).

    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    '''

    # Initialize empty list for data.
    tvseries = []

    # Extract movie titles.
    for title in dom("div.lister-item-content h3 a"):
        tvseries.append([plaintext(title.content).encode('utf-8', errors='ignore')])

    # Extract ratings of TV series and append accordingly to list.
    for rating, i in zip(dom("div.ratings-imdb-rating"), range(0,50)):
        tvseries[i].append(plaintext(rating.content))

    # Extract genre of TV series and append accordingly to list.
    for genre, j in zip(dom.by_class("genre"), range(0,50)):
        tvseries[j].append(plaintext(genre.content).encode('utf-8', errors='ignore'))

    # Extract actors of TV series and append accordingly to list.
    for actors, k in zip(dom("p[class='text-muted'] + p"), range(0,50)):
        tvseries[k].append(plaintext(actors.content).strip("Stars:").encode('utf-8', errors='ignore'))

    # Extract runtime of TV series and append accordingly to list.
    for runtime, l in zip(dom("span.runtime"), range(0,50)):
        tvseries[l].append(plaintext(runtime.content).strip(" min"))

    # Return list of TV series information.
    return tvseries

def save_csv(f, tvseries):
    '''
    Output a CSV file containing highest rated TV-series.
    '''
    writer = csv.writer(f)
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])
    # Write information from list into CSV.
    for i in tvseries:
        writer.writerow(i)


    # ADD SOME CODE OF YOURSELF HERE TO WRITE THE TV-SERIES TO DISK

if __name__ == '__main__':
    # Download the HTML file
    url = URL(TARGET_URL)
    html = url.download()

    # Save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation
    dom = DOM(html)

    # Extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # Write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'wb') as output_file:
        save_csv(output_file, tvseries)
