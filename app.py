from flask import Flask, request, jsonify
from flask_cors import CORS
from groq_api import generate_article, generate_html

app = Flask(__name__)
CORS(app)

@app.route("/generate-article", methods=["POST"])
def generate_article_endpoint():
    """
    Handles requests for article generation.
    Expects JSON payload with a 'topic' key.
    """
    try:
        # Parse JSON payload
        data = request.get_json()
        topic = data.get("topic")

        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        # Prompt for generating the article                                                                                     
        prompt = f"Generate a detailed, plagiarism-free article on the topic: '{topic}'. Ensure it is easy to understand for high school-level readers. Include proper credits where necessary."

        # Generate article using Groq API
        article = generate_article(prompt)

        return jsonify({"message": "Article generated", "article": article}), 200

    except Exception as e:
        # Handle any unexpected errors
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500


@app.route("/generate-article-html", methods=["POST"])
def generate_article_html_endpoint():
    """
    Handles requests for generating HTML from the article.
    Expects JSON payload with 'main_article', 'number_of_sections',
    'words_per_section', and 'image_urls' keys.
    """
    try:
        # Parse JSON payload
        data = request.get_json()
        main_article = data.get("main_article")
        number_of_sections = data.get("number_of_sections")
        words_per_section = data.get("words_per_section")
        image_urls = data.get("image_urls")

        # Validate input
        if not main_article or not number_of_sections or not words_per_section or not image_urls:
            return jsonify({"error": "Missing required input parameters"}), 400

        # Prompt for generating HTML
        prompt = f"""
!!!CRITICAL: OUTPUT REQUIREMENTS!!!
1. Output must be pure HTML without any escape characters (\n, \t, etc.)
2. All HTML should be on a single line
3. No newlines or special formatting
4. JSON response should contain raw HTML without any escape sequences
5. use images as well in the article that is provided in the input as Image URLs

Input Parameters:
- Number of sections: {number_of_sections}
- Words per section: {words_per_section}
- Images: {len(image_urls)}
- Image URLs: {', '.join(image_urls)}

Input Article:
{main_article}

EXPECTED OUTPUT FORMAT:
{{
  "html_output": "<!DOCTYPE html><html><head><title>...</title></head><body>...</body></html>",
  "message": "HTML generated"
}}
"""

        # Generate HTML using Groq API
        html_output = generate_html(prompt)

        return jsonify(html_output), 200

    except Exception as e:
        # Handle any unexpected errors
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500


if __name__ == "__main__":
    # Run the application with debugging enabled
    app.run(debug=True)
