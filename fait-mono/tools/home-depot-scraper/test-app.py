from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return """
    <html>
    <head>
        <title>Home Depot Scraper Test</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            h1 { color: #f96302; }
            .container { max-width: 800px; margin: 0 auto; }
            .btn {
                background-color: #f96302;
                color: white;
                padding: 10px 15px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; }
            input, select { width: 100%; padding: 8px; box-sizing: border-box; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Home Depot Product Data Extractor</h1>
            <div>
                <h2>Create New Job</h2>
                <div class="form-group">
                    <label for="output_dir">Output Directory:</label>
                    <input type="text" id="output_dir" value="data/test_output">
                    <button id="validate_dir_btn" class="btn">Validate Directory</button>
                </div>
                <div class="form-group">
                    <label for="search_type">Search Type:</label>
                    <select id="search_type">
                        <option value="search_term">Search Term</option>
                        <option value="category">Category</option>
                        <option value="url_list">URL List</option>
                    </select>
                </div>
                <div id="search_terms_container" class="form-group">
                    <label for="search_term_input">Search Terms:</label>
                    <input type="text" id="search_term_input" placeholder="Enter search term and press Enter">
                    <div id="search_terms_list"></div>
                </div>
                <div id="category_container" class="form-group" style="display:none;">
                    <label for="category_id">Category:</label>
                    <select id="category_id">
                        <option value="Building Materials">Building Materials</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                    </select>
                </div>
                <div id="urls_container" class="form-group" style="display:none;">
                    <label for="url_input">URLs:</label>
                    <input type="text" id="url_input" placeholder="Enter URL and press Enter">
                    <div id="urls_list"></div>
                </div>
                <div class="form-group">
                    <label for="max_pages">Max Pages:</label>
                    <input type="number" id="max_pages" value="1">
                </div>
                <div class="form-group">
                    <label for="max_products">Max Products:</label>
                    <input type="number" id="max_products" value="10">
                </div>
                <h3>Customize CSV Headers</h3>
                <div id="csv_headers_container">
                    <div class="form-group">
                        <label for="product_name">Product Name:</label>
                        <input type="text" name="product_name" value="Product Name">
                    </div>
                </div>
                <button id="submit_job" class="btn">Submit Job</button>
            </div>
            <div>
                <h2>Recent Jobs</h2>
                <div id="jobs_list"></div>
            </div>
        </div>
        <script>
            // Simple JavaScript to make the UI interactive for testing
            document.getElementById('search_type').addEventListener('change', function() {
                const searchType = this.value;
                document.getElementById('search_terms_container').style.display =
                    searchType === 'search_term' ? 'block' : 'none';
                document.getElementById('category_container').style.display =
                    searchType === 'category' ? 'block' : 'none';
                document.getElementById('urls_container').style.display =
                    searchType === 'url_list' ? 'block' : 'none';
            });

            document.getElementById('validate_dir_btn').addEventListener('click', function() {
                const dir = document.getElementById('output_dir').value;
                alert('Files will be saved to: ' + dir);
            });

            document.getElementById('search_term_input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const term = this.value.trim();
                    if (term) {
                        const div = document.createElement('div');
                        div.textContent = term;
                        document.getElementById('search_terms_list').appendChild(div);
                        this.value = '';
                    }
                }
            });

            document.getElementById('url_input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const url = this.value.trim();
                    if (url) {
                        const div = document.createElement('div');
                        div.textContent = url;
                        document.getElementById('urls_list').appendChild(div);
                        this.value = '';
                    }
                }
            });

            document.getElementById('submit_job').addEventListener('click', function() {
                alert('Job submitted successfully!');
                window.location.href = '/job/1';
            });
        </script>
    </body>
    </html>
    """

@app.route('/job/<job_id>')
def job_details(job_id):
    return f"""
    <html>
    <head>
        <title>Job {job_id} Details</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; }}
            h1 {{ color: #f96302; }}
            .container {{ max-width: 800px; margin: 0 auto; }}
            .status {{ padding: 5px 10px; border-radius: 4px; display: inline-block; }}
            .status.running {{ background-color: #ffc107; color: black; }}
            .status.completed {{ background-color: #28a745; color: white; }}
            .log {{ background-color: #f8f9fa; padding: 10px; border-radius: 4px; height: 200px; overflow-y: auto; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Job {job_id} Details</h1>
            <div>
                <h3>Status: <span class="status completed">Completed</span></h3>
                <p>Started: 2025-05-12 14:30:00</p>
                <p>Completed: 2025-05-12 14:31:00</p>
                <h3>Log</h3>
                <div class="log">
                    [2025-05-12 14:30:00] Job {job_id} started<br>
                    [2025-05-12 14:30:10] Found 5 product URLs<br>
                    [2025-05-12 14:30:30] Scraped 5 products successfully<br>
                    [2025-05-12 14:30:45] Saving results to CSV...<br>
                    [2025-05-12 14:31:00] Job {job_id} completed
                </div>
                <h3>Results</h3>
                <p>Download: <a href="#">homedepot_results_20250512_143100.csv</a></p>
            </div>
        </div>
    </body>
    </html>
    """

@app.route('/api/start_job', methods=['POST'])
def start_job():
    return jsonify({
        'job_id': 1,
        'status': 'success'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
