import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize the Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_article(prompt):
    """
    Use the Groq client to generate an article based on the provided prompt.
    """
    try:
        # Call the Groq chat completion API for article generation
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a content writer.'"
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            model="llama-3.3-70b-versatile"  # Replace with the desired model
        )

        # Extract and return the generated content
        return chat_completion.choices[0].message.content

    except Exception as e:
        raise Exception(f"Groq API Error: {e}")


def generate_html(prompt):
    """
    Use the Groq client to generate an HTML document based on the provided prompt.
    """
    try:
        # Call the Groq chat completion API for HTML generation
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a web developer that is developing a blog app in react typescript with shadcn and tailwind-css with strong content writing and communication skills.'"
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            model="llama-3.3-70b-versatile"   # Replace with the desired model
        )

        # Extract and return the generated content
        return chat_completion.choices[0].message.content

    except Exception as e:
        raise Exception(f"Groq API Error: {e}")
