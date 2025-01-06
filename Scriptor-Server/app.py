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

        # Prepare image URLs and credits for the prompt
        image_urls_with_credits = [f"{item['image']} (Credit: {item['credit']})" for item in image_urls]

        # Prompt for generating HTML
        prompt = f"""
!!!CRITICAL: OUTPUT MUST BE PURE HTML CODE THAT IS INSIDE <body> tag ONLY AND DO NOT GIVE <body> tag. NO INTRODUCTORY TEXT, NO COMMENTARY!!!

Objective: Generate a plagiarism-free article in HTML format with Tailwind CSS styling, based on the input article. Make it easy for high school readers to understand.

Requirements:
- Article sections: {number_of_sections} !!STRICT REQUIREMENT!!
- Words per section: {words_per_section}
- Images: {len(image_urls)}
- Image URLs: {', '.join(item['image'] for item in image_urls)}
Image URLs with Credits: {', '.join(image_urls_with_credits)}
- Write a conclusion section at the very end of the article.

Styling Requirements:
- Section headings: text-xl font-bold my-2
- Images: my-2 class rounded-xl
- Images: Centered around parent container with max-width: 100%
- Images: After every image attach their credit too in light gray center, text-sm text-gray-300 mt-1 mb-2
- Text: Regular body text with normal legible styling
- Main container: container mx-auto px-4 max-w-3xl

Input Article:
{main_article}

!!!CRITICAL: OUTPUT MUST BE PURE HTML CODE THAT IS INSIDE <body> tag ONLY AND DO NOT GIVE <body> tag. NO INTRODUCTORY TEXT, NO COMMENTARY!!!
"""

        # Generate HTML using Groq API
        html_output = generate_html(prompt)

        return jsonify({"message": "HTML generated", "html_output": html_output}), 200

    except Exception as e:
        # Handle any unexpected errors
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500


if __name__ == "__main__":
    # Run the application with debugging enabled
    app.run(debug=True)
