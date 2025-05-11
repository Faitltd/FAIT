"""
Utility functions for the Lowe's scraper.
"""

import os
import re
import csv
import logging
from urllib.parse import urlparse, parse_qs
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)

def clean_url(url):
    """Remove query parameters from a URL.

    Args:
        url (str): URL to clean

    Returns:
        str: Cleaned URL
    """
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}{parsed.path}"

def clean_filename(s):
    """Convert a string to a valid filename.

    Args:
        s (str): String to convert

    Returns:
        str: Valid filename
    """
    # Replace invalid characters with underscores
    s = re.sub(r'[\\/*?:"<>|]', '_', s)
    # Replace spaces with underscores
    s = s.replace(' ', '_')
    # Limit length
    return s[:50]

def extract_product_id(url):
    """Extract the product ID from a Lowe's product URL.

    Args:
        url (str): Lowe's product URL

    Returns:
        str: Product ID or a placeholder if not found
    """
    try:
        parsed_url = urlparse(url)
        
        # Check if it's a Lowe's URL
        if 'lowes.com' not in parsed_url.netloc:
            return f"unknown_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Extract the product ID from the path
        path_parts = parsed_url.path.strip('/').split('/')
        if len(path_parts) >= 3 and path_parts[0] == 'pd':
            return path_parts[-1]  # Last part should be the product ID
        
        # If we can't extract the ID from the path, try the query parameters
        query_params = parse_qs(parsed_url.query)
        if 'productId' in query_params:
            return query_params['productId'][0]
        
        # If all else fails, use a timestamp as a placeholder
        return f"unknown_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    except Exception as e:
        logger.error(f"Error extracting product ID from URL: {str(e)}")
        return f"error_{datetime.now().strftime('%Y%m%d%H%M%S')}"

def get_output_filename(output_dir, format, prefix="lowes_products", suffix=""):
    """Generate an output filename based on the current date and time.

    Args:
        output_dir (str): Output directory
        format (str): File format ('csv' or 'json')
        prefix (str, optional): Filename prefix
        suffix (str, optional): Filename suffix

    Returns:
        str: Output filename
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{prefix}_{timestamp}{suffix}.{format}"
    return os.path.join(output_dir, filename)

def convert_to_template(product, template):
    """Convert a product to the template format.

    Args:
        product (dict): Product data
        template (dict): Template configuration

    Returns:
        dict: Product data in template format
    """
    result = {header: "" for header in template['headers']}
    
    # Map product data to template
    if 'title' in product:
        result['product_name'] = product['title']
    
    if 'item_id' in product:
        result['item_id'] = product['item_id']
    
    if 'model_id' in product:
        result['model_number'] = product['model_id']
    
    if 'upc' in product:
        result['upc'] = product['upc']
    
    if 'url' in product:
        result['url'] = product['url']
    
    if 'buybox_winner' in product and 'price' in product['buybox_winner']:
        result['price'] = product['buybox_winner']['price']
        result['currency'] = template['default_currency']
        result['unit'] = template['default_unit']
    
    if 'description' in product:
        result['details'] = product['description']
    
    if 'specifications' in product:
        result['specifications'] = str(product['specifications'])
    
    if 'brand' in product:
        result['brand'] = product['brand']
    
    if 'images' in product:
        # Join multiple image URLs with a separator
        result['images'] = "|".join(product['images'])
    
    # Add default values
    result['supplier'] = "Lowes"
    result['markup'] = "43%"
    
    # Copy price to cost
    if 'price' in result:
        result['cost'] = result['price']
    
    return result

def load_urls(file_path):
    """Load URLs from a file.

    Args:
        file_path (str): Path to the file containing URLs

    Returns:
        list: List of URLs
    """
    urls = []
    try:
        with open(file_path, 'r') as f:
            for line in f:
                url = line.strip()
                if url and not url.startswith('#'):
                    urls.append(url)
        logger.info(f"Loaded {len(urls)} URLs from {file_path}")
    except Exception as e:
        logger.error(f"Error loading URLs from {file_path}: {str(e)}")
    
    return urls

def save_to_csv_with_custom_headers(products, output_file, custom_headers):
    """Save products to a CSV file with custom headers.

    Args:
        products (list): List of product dictionaries
        output_file (str): Output file path
        custom_headers (dict): Mapping of original field names to custom headers

    Returns:
        str: Path to the saved file
    """
    try:
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            # Use custom headers as fieldnames
            fieldnames = list(custom_headers.values())
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            # Write each product with custom headers
            for product in products:
                row = {}
                for orig_field, custom_field in custom_headers.items():
                    if orig_field in product:
                        row[custom_field] = product[orig_field]
                    else:
                        row[custom_field] = ""
                writer.writerow(row)
        
        logger.info(f"Saved {len(products)} products to CSV with custom headers: {output_file}")
        return output_file
    except Exception as e:
        logger.error(f"Error saving to CSV with custom headers: {str(e)}")
        return None
