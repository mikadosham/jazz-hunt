import requests
from bs4 import BeautifulSoup
import os
from urllib.parse import urljoin

def download_pdf(url, dest_folder):
    # Get the page content
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Find all PDFs directly linked on the page
    pdf_links = [link['href'] for link in soup.find_all('a', href=True) if link['href'].endswith('.pdf')]

    # Also check for embedded PDFs (often in iframes or objects)
    embedded_pdfs = []
    for iframe in soup.find_all('iframe', src=True):
        if iframe['src'].endswith('.pdf'):
            embedded_pdfs.append(iframe['src'])
    for obj in soup.find_all('object', data=True):
        if obj['data'].endswith('.pdf'):
            embedded_pdfs.append(obj['data'])

    # Combine all found PDFs
    all_pdfs = pdf_links + embedded_pdfs

    # Download each PDF
    for pdf_link in all_pdfs:
        full_url = urljoin(url, pdf_link)
        pdf_response = requests.get(full_url)
        pdf_name = os.path.join(dest_folder, pdf_link.split('/')[-1])
        with open(pdf_name, 'wb') as f:
            f.write(pdf_response.content)
        print(f"Downloaded {pdf_name}")

# URL of the main webpage
main_url = "https://www.doctoruke.com/songs.html"

# Request the main page
response = requests.get(main_url)
soup = BeautifulSoup(response.text, 'html.parser')

# Find all song links
song_links = [urljoin(main_url, link['href']) for link in soup.find_all('a', href=True) if link['href'].endswith('.pdf') or link['href'].endswith('.html')]

# Directory to save PDFs
os.makedirs('downloaded_pdfs', exist_ok=True)

# Process each song page
for song_url in song_links:
    if song_url.endswith('.pdf'):
        # Direct PDF link
        download_pdf(song_url, 'downloaded_pdfs')
    else:
        # HTML page that may contain PDFs
        download_pdf(song_url, 'downloaded_pdfs')

print(f"Downloaded all PDFs from the site.")
