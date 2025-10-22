# Manga Downloader for manga-starz.com

This project contains several scripts to download manga chapters from manga-starz.com. Due to the website's Cloudflare protection, automated downloading is currently limited.

## Files Overview

### Main Downloaders
1. **`manga_downloader.py`** - Original Selenium-based downloader
2. **`manga_downloader_fixed.py`** - Improved version with better Cloudflare handling
3. **`manga_downloader_undetected.py`** - Uses undetected-chromedriver
4. **`manga_downloader_requests.py`** - Pure requests-based approach

### Utilities
- **`image_organizer.py`** - Organize manually downloaded images
- **`requirements.txt`** - Python dependencies

## Current Status

⚠️ **Important**: The website manga-starz.com currently uses strong Cloudflare protection that blocks automated scraping. All scripts will encounter:
- "Just a moment..." challenge pages (Selenium-based scripts)
- 403 Forbidden errors (requests-based scripts)

## Installation

1. Create a virtual environment:
```bash
python3 -m venv manga_env
source manga_env/bin/activate  # On Windows: manga_env\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Install Chrome and ChromeDriver (for Selenium versions):
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y google-chrome-stable

# Download ChromeDriver
wget https://storage.googleapis.com/chrome-for-testing-public/138.0.7204.168/linux64/chromedriver-linux64.zip
unzip chromedriver-linux64.zip
sudo mv chromedriver-linux64/chromedriver /usr/local/bin/
sudo chmod +x /usr/local/bin/chromedriver
```

## Usage

### Automated Download (Currently Blocked)
```bash
python manga_downloader.py
```

### Manual Organization
If you manually download images, use the organizer:
```bash
python image_organizer.py
```

## Configuration

Edit the chapter range in any downloader script:
```python
start_chapter = 133
end_chapter = 150
```

## Alternative Solutions

Since automated downloading is currently blocked:

1. **Manual Download**: Save images manually and use `image_organizer.py`
2. **Alternative Sources**: Look for the same manga on other sites
3. **Proxy Services**: Use rotating proxies (advanced)
4. **Wait and Retry**: Cloudflare protection may change over time

## Script Features

### Selenium-based Scripts
- Headless Chrome browser
- Anti-detection measures
- Dynamic content loading
- Cloudflare bypass attempts

### Requests-based Script
- Direct HTTP requests
- Session management
- HTML parsing with BeautifulSoup
- Faster than browser automation

### Image Organizer
- Organize images into chapter folders
- Rename files sequentially
- Create empty chapter folders
- Support multiple image formats

## Dependencies

- `selenium` - Browser automation
- `requests` - HTTP requests
- `beautifulsoup4` - HTML parsing
- `undetected-chromedriver` - Anti-detection
- `setuptools` - Python utilities

## Troubleshooting

### Common Issues

1. **Cloudflare Protection**
   - Error: "Just a moment..." or 403 Forbidden
   - Solution: Currently no reliable solution

2. **ChromeDriver Issues**
   - Error: ChromeDriver not found
   - Solution: Ensure ChromeDriver is in PATH

3. **Permission Errors**
   - Error: Cannot create directories
   - Solution: Run with appropriate permissions

## Legal Notice

This tool is for educational purposes only. Please respect:
- Website terms of service
- Copyright laws
- Rate limiting
- Server resources

## Future Improvements

- CAPTCHA solving integration
- Proxy rotation support
- Better anti-detection measures
- Alternative site support
- GUI interface

## Support

If the scripts work in the future or you need modifications:
1. Check for website structure changes
2. Update selectors in the scripts
3. Adjust timing and delays
4. Consider new anti-detection methods

---

**Note**: This project was created as a technical demonstration. The effectiveness depends on the target website's security measures, which can change at any time.
