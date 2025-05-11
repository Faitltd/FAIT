"""
Lowe's Scraper Module

This module provides functionality to scrape product data from Lowe's
building materials category and subcategories.
"""

import os
import json
import time
import logging
import csv
from datetime import datetime
from urllib.parse import urljoin

from .api import LowesClient
from .utils import clean_url, clean_filename, extract_product_id, convert_to_template, get_output_filename, save_to_csv_with_custom_headers
from config.lowes_settings import RAW_DATA_DIR, RESULTS_DIR, CSV_TEMPLATE, CLEAN_URLS

# Configure logging
logger = logging.getLogger(__name__)

# Set logging level to DEBUG for more detailed output
logger.setLevel(logging.DEBUG)

class LowesScraper:
    """Scraper for Lowe's product data."""

    def __init__(self, api_key, output_dir="data", max_retries=3, delay=1):
        """Initialize the scraper.

        Args:
            api_key (str): BigBox API key
            output_dir (str): Directory to store output data
            max_retries (int): Maximum number of retries for failed requests
            delay (int): Delay between API requests in seconds
        """
        self.client = LowesClient(api_key, max_retries=max_retries)
        self.output_dir = output_dir
        self.delay = delay
        self.products = []
        self.product_urls = set()  # Use a set to avoid duplicates

        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)

        # Check if we're using the Desktop
        is_desktop = os.path.basename(os.path.normpath(output_dir)) == 'Desktop'
        if is_desktop:
            # For cloud environments, use a safer path
            self.output_dir = os.path.join(os.getcwd(), "data", "desktop")
            os.makedirs(self.output_dir, exist_ok=True)
            logger.info(f"Using cloud-safe path for Desktop: {self.output_dir}")

        # Create raw data and results directories
        self.raw_data_dir = os.path.join(self.output_dir, RAW_DATA_DIR)
        self.results_dir = os.path.join(self.output_dir, RESULTS_DIR)
        os.makedirs(self.raw_data_dir, exist_ok=True)
        os.makedirs(self.results_dir, exist_ok=True)

    def scrape_category(self, category_id, max_pages=5, max_products=0, sort_by=None):
        """Scrape products from a specific category.

        Args:
            category_id (str): Lowe's category ID
            max_pages (int): Maximum number of pages to scrape
            max_products (int): Maximum number of products to scrape (0 for all)
            sort_by (str, optional): How to sort results (e.g., 'best_seller')

        Returns:
            list: List of product URLs
        """
        logger.info(f"Scraping category: {category_id}")
        product_urls = []

        # Scrape each page up to max_pages
        for page in range(1, max_pages + 1):
            logger.info(f"Scraping page {page}/{max_pages} for category '{category_id}'")

            # Add delay between requests
            if page > 1:
                time.sleep(self.delay)

            # Get category data
            try:
                category_data = self.client.get_category_products(category_id, page=page)
                
                # Save raw data
                raw_data_file = os.path.join(
                    self.raw_data_dir, 
                    f"category_{category_id}_page_{page}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                )
                with open(raw_data_file, 'w') as f:
                    json.dump(category_data, f, indent=2)
                
                # Extract product URLs
                if 'category' in category_data and 'products' in category_data['category']:
                    products = category_data['category']['products']
                    logger.info(f"Found {len(products)} products on page {page}")
                    
                    for product in products:
                        if 'link' in product:
                            url = product['link']
                            if CLEAN_URLS:
                                url = clean_url(url)
                            product_urls.append(url)
                            self.product_urls.add(url)
                            
                            # Check if we've reached the maximum number of products
                            if max_products > 0 and len(self.product_urls) >= max_products:
                                logger.info(f"Reached maximum number of products: {max_products}")
                                return list(self.product_urls)[:max_products]
                else:
                    logger.warning(f"No products found on page {page} for category '{category_id}'")
                    break
                    
                # Check if there are more pages
                if 'category' in category_data and 'pagination' in category_data['category']:
                    pagination = category_data['category']['pagination']
                    if page >= pagination.get('total_pages', 0):
                        logger.info(f"Reached last page ({page}) for category '{category_id}'")
                        break
            except Exception as e:
                logger.error(f"Error scraping category '{category_id}' page {page}: {str(e)}")
                break

        return list(self.product_urls)

    def scrape_search_term(self, search_term, max_pages=5, max_products=0, sort_by=None):
        """Scrape products using a search term.

        Args:
            search_term (str): Search term to find products
            max_pages (int): Maximum number of pages to scrape
            max_products (int): Maximum number of products to scrape (0 for all)
            sort_by (str, optional): How to sort results (e.g., 'best_seller')

        Returns:
            list: List of product URLs
        """
        logger.info(f"Scraping search term: {search_term}")
        product_urls = []

        # Scrape each page up to max_pages
        for page in range(1, max_pages + 1):
            logger.info(f"Scraping page {page}/{max_pages} for term '{search_term}'")

            # Add delay between requests
            if page > 1:
                time.sleep(self.delay)

            # Get search results
            try:
                search_data = self.client.search_products(search_term, page=page, sort_by=sort_by)
                
                # Save raw data
                raw_data_file = os.path.join(
                    self.raw_data_dir, 
                    f"search_{clean_filename(search_term)}_page_{page}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                )
                with open(raw_data_file, 'w') as f:
                    json.dump(search_data, f, indent=2)
                
                # Extract product URLs
                if 'search' in search_data and 'products' in search_data['search']:
                    products = search_data['search']['products']
                    logger.info(f"Found {len(products)} products on page {page}")
                    
                    for product in products:
                        if 'link' in product:
                            url = product['link']
                            if CLEAN_URLS:
                                url = clean_url(url)
                            product_urls.append(url)
                            self.product_urls.add(url)
                            
                            # Check if we've reached the maximum number of products
                            if max_products > 0 and len(self.product_urls) >= max_products:
                                logger.info(f"Reached maximum number of products: {max_products}")
                                return list(self.product_urls)[:max_products]
                else:
                    logger.warning(f"No products found on page {page} for term '{search_term}'")
                    break
                    
                # Check if there are more pages
                if 'search' in search_data and 'pagination' in search_data['search']:
                    pagination = search_data['search']['pagination']
                    if page >= pagination.get('total_pages', 0):
                        logger.info(f"Reached last page ({page}) for term '{search_term}'")
                        break
            except Exception as e:
                logger.error(f"Error scraping search term '{search_term}' page {page}: {str(e)}")
                break

        return list(self.product_urls)

    def scrape_specific_urls(self, urls, max_products=0):
        """Scrape specific product URLs.

        Args:
            urls (list): List of product URLs
            max_products (int): Maximum number of products to scrape (0 for all)

        Returns:
            list: List of product URLs
        """
        logger.info(f"Scraping {len(urls)} specific URLs")
        
        # Add URLs to the set
        for url in urls:
            if CLEAN_URLS:
                url = clean_url(url)
            self.product_urls.add(url)
            
            # Check if we've reached the maximum number of products
            if max_products > 0 and len(self.product_urls) >= max_products:
                logger.info(f"Reached maximum number of products: {max_products}")
                break

        return list(self.product_urls)[:max_products] if max_products > 0 else list(self.product_urls)

    def fetch_product_details(self, callback=None):
        """Fetch detailed product information for all collected URLs.

        Args:
            callback (function, optional): Callback function to report progress

        Returns:
            list: List of product details
        """
        logger.info(f"Fetching details for {len(self.product_urls)} products")
        self.products = []
        
        # Convert set to list for iteration with index
        urls = list(self.product_urls)
        
        for i, url in enumerate(urls):
            logger.info(f"Fetching product {i+1}/{len(urls)}: {url}")
            
            # Report progress if callback is provided
            if callback:
                callback(i, len(urls), f"Fetching product {i+1}/{len(urls)}")
            
            # Add delay between requests
            if i > 0:
                time.sleep(self.delay)
            
            try:
                # Get product data
                product_data = self.client.get_product_by_url(url)
                
                # Save raw data
                product_id = extract_product_id(url)
                raw_data_file = os.path.join(
                    self.raw_data_dir, 
                    f"product_{product_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                )
                with open(raw_data_file, 'w') as f:
                    json.dump(product_data, f, indent=2)
                
                # Add to products list
                if 'product' in product_data:
                    product = product_data['product']
                    product['url'] = url  # Ensure URL is included
                    self.products.append(product)
                else:
                    logger.warning(f"No product data found for URL: {url}")
            except Exception as e:
                logger.error(f"Error fetching product details for URL {url}: {str(e)}")
        
        logger.info(f"Fetched details for {len(self.products)} products")
        return self.products

    def save_results(self, format="csv", output_file=None, custom_headers=None):
        """Save scraped product data to a file.

        Args:
            format (str): Output format ('csv' or 'json')
            output_file (str, optional): Custom output filename
            custom_headers (dict, optional): Custom CSV headers mapping

        Returns:
            str: Path to the saved file
        """
        if not self.products:
            logger.warning("No products to save")
            return None
        
        # Generate output filename if not provided
        if not output_file:
            output_file = get_output_filename(self.results_dir, format)
        
        # Ensure the output directory exists
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        if format.lower() == 'csv':
            # Save as CSV
            if custom_headers:
                # Use custom headers
                return save_to_csv_with_custom_headers(self.products, output_file, custom_headers)
            else:
                # Use default headers
                with open(output_file, 'w', newline='', encoding='utf-8') as f:
                    # Determine CSV headers based on the first product
                    if self.products:
                        fieldnames = list(self.products[0].keys())
                        writer = csv.DictWriter(f, fieldnames=fieldnames)
                        writer.writeheader()
                        writer.writerows(self.products)
                    else:
                        f.write('')  # Create empty file
        else:
            # Save as JSON
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(self.products, f, indent=2)
        
        logger.info(f"Saved {len(self.products)} products to {output_file}")
        return output_file

    def save_results_template(self, output_file=None):
        """Save scraped product data to a CSV file using the template format.

        Args:
            output_file (str, optional): Custom output filename

        Returns:
            str: Path to the saved file
        """
        if not self.products:
            logger.warning("No products to save")
            return None
        
        # Generate output filename if not provided
        if not output_file:
            output_file = get_output_filename(self.results_dir, 'csv', suffix='_template')
        
        # Ensure the output directory exists
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        # Convert products to template format
        template_products = [convert_to_template(product, CSV_TEMPLATE) for product in self.products]
        
        # Save as CSV
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=CSV_TEMPLATE['headers'])
            writer.writeheader()
            writer.writerows(template_products)
        
        logger.info(f"Saved {len(template_products)} products to template CSV: {output_file}")
        return output_file
