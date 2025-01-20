from turtle import title
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq_api import generate_article, generate_html
import requests

app = Flask(__name__)
CORS(app)

main_article = """"""


@app.route("/publish-article", methods=["POST"])
def publish_article_endpoint():
    """
    Handles requests for publishing the article.
    """
    try:
        # Parse JSON payload
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        url = "http://localhost:6969/test-conversion" # this is nexis backend local endpoint
        title = data.get("title")
        thumbnail_url = data.get("thumbnail_url")
        # Get HTML content from request
        html_content = data.get("html_string", "")

        if not title or not thumbnail_url:
            return jsonify({"error": "Missing required fields (title, thumbnail_url, or html_string)"}), 400

        # Publish article
        headers = {
            "x-access-key": "######"  # Add your access key here
        }
        response = requests.post(url, json={
            "articleTitle": title,
            "imageUrl": thumbnail_url,
            "html_string": html_content
        }, headers=headers)  

        if response.status_code == 200:
            return jsonify(response.json()), 200
        else:
            return jsonify({"error": f"Failed to publish article: {response.text}"}), response.status_code

    except requests.RequestException as e:
        return jsonify({"error": f"Network error: {str(e)}"}), 500
    except Exception as e:
        # Handle any unexpected errors
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500


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

        # Prepare image URLs and credits for the prompt
        image_urls_with_credits = [
            f"{item['image']} (Credit: {item['credit']})" for item in image_urls]

        # Prompt for generating HTML
        prompt = f"""
!!!CRITICAL: OUTPUT MUST BE PURE HTML CODE THAT IS INSIDE <body> tag ONLY AND DO NOT GIVE <body> tag. NO INTRODUCTORY TEXT, NO COMMENTARY!!!

Objective: Generate a plagiarism-free article in HTML format with Tailwind CSS styling, based on the input article. Make it easy for high school readers to understand.

Requirements:
- Article sections: {number_of_sections} !!STRICT REQUIREMENT!!
- Enclose each section in a section tag with a unique ID. 
- User h2 tag for headings inside a section.
- Words per section: {words_per_section}
- Images: {len(image_urls)}
- Image URLs: {', '.join(item['image'] for item in image_urls)}
- Image URLs with Credits: {', '.join(image_urls_with_credits)}
- img tags should have class 'w-full mr-2 mt-2 mb-1 rounded-xl'
- Write a conclusion section at the very end of the article.
- End with a section named Sources and use sources provided in the input article.
- For the HTML output, the entire section tags list should be enclosed in a div with a class of 'container'.

Styling Requirements:
- Section headings: text-xl font-bold my-2
- Images: proper margins between paragraphs and images with my-2 class
- Images: my-2 class rounded-xl
- Images: contains a class that makes it in the center of the parent tag always with mx-auto
- Images: After every image attach their credit too in light gray, center, text-sm text-gray-300 mt-1 mb-2, centered
- Text: Regular body text with normal legible styling
- Main container: container mx-auto px-4 max-w-3xl

Input Article:
{main_article}

!!!CRITICAL: OUTPUT MUST BE PURE HTML CODE THAT IS INSIDE <body> tag ONLY AND DO NOT GIVE <body> tag. NO INTRODUCTORY TEXT, NO COMMENTARY!!!
"""

        # Generate HTML using Groq API
        html_output = generate_html(prompt)
        main_article = html_output
        print(main_article)

        return jsonify({"message": "HTML generated", "html_output": html_output}), 200

    except Exception as e:
        # Handle any unexpected errors
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500


if __name__ == "__main__":
    # Run the application with debugging enabled
    app.run(debug=True)
