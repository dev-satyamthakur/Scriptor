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
        !!!CRITICAL: OUTPUT MUST BE PURE HTML CODE THAT IS INSIDE <body> tag ONLY AND DO NOT GIVE <body> tag. NO INTRODUCTORY TEXT, NO COMMENTARY!!!

Objective: Generate a simplified, plagiarism-free article in HTML format, based on the input article. Ensure it is easy to understand for high school-level readers and includes proper credits and references. Maintain a professional structure with appropriate HTML tags and IDs. Follow the provided inputs for structuring.

Prompt:
Read this article and generate plagiarism-free, simplified content while retaining the original context and meaning. The audience is high school-level readers, so make it easy to understand. Follow these formatting guidelines:

Article Title: Provide a title for the article that captures its essence.
Content Simplification: Rewrite the content in simpler language while ensuring accuracy.
HTML Structure: Output the article in pure HTML format, including:


Sectioned content based on the given number of sections ({number_of_sections}).
The number of words for each section as specified ({words_per_section}).
Use appropriate HTML tags (<section>, <p>, <h2>, etc.) and provide unique IDs for each section (e.g., section-1, section-2).
Images: Add {len(image_urls)} images in the article. Use the provided URLs for the <img> tags and ensure the credits for each image are mentioned in the alt attribute (e.g., alt="Image credit: [source]").
Output Requirements: Only provide the HTML code that would go inside the <body> tag. Use clear and semantic HTML.

Input Parameters:
- Number of sections: {number_of_sections}
- Words per section: {words_per_section}
- Images: {len(image_urls)}
- Image URLs: {', '.join(image_urls)}

Input Article:
{main_article}

Image URLs with Credits:
{', '.join(image_urls)}

Expected Output:
Strict Syntactical HTML document as per the input parameters. Ensure the article is plagiarism-free, simplified, and uses the specified images and section structure.

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
